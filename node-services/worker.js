const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { runCommand } = require('./helpers');
const { v4: uuidv4 } = require('uuid');

let queue = [];
let running = false;

// persist minimal job files
function persistJob(job){
  const storeDir = path.join(app.getPath('userData'), 'rtg_jobs');
  if(!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });
  fs.writeFileSync(path.join(storeDir, job.id + '.json'), JSON.stringify(job, null, 2));
}

async function processJob(job){
  job.state = 'processing';
  persistJob(job);
  try{
    const info = await runCommand('yt-dlp', ['-j', job.url]);
    const meta = JSON.parse(info.stdout || '{}');

    let bestVideo = null;
    let bestAudio = null;
    for(const f of meta.formats || []){
      if(f.vcodec !== 'none' && f.acodec === 'none'){
        if(!bestVideo || (f.height || 0) > (bestVideo.height || 0)) bestVideo = f;
      }
      if(f.acodec !== 'none' && f.vcodec === 'none'){
        if(!bestAudio || (f.abr || 0) > (bestAudio.abr || 0)) bestAudio = f;
      }
    }

    const outDir = path.join(app.getPath('userData'), 'rtg_media');
    if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    if(bestVideo && bestAudio){
      const videoFile = path.join(outDir, `${job.id}_video.${bestVideo.ext||'mp4'}`);
      const audioFile = path.join(outDir, `${job.id}_audio.${bestAudio.ext||'m4a'}`);
      const mergedFile = path.join(outDir, `${job.id}_merged.mp4`);

      await runCommand('yt-dlp', ['-f', String(bestVideo.format_id), '-o', videoFile, job.url]);
      await runCommand('yt-dlp', ['-f', String(bestAudio.format_id), '-o', audioFile, job.url]);

      await runCommand('ffmpeg', ['-y', '-i', videoFile, '-i', audioFile, '-c', 'copy', mergedFile]);

      job.state = 'done';
      job.result = { filePath: mergedFile };
      persistJob(job);
      return job;
    }

    if(meta.url && (!bestVideo && !bestAudio)){
      const filename = path.join(outDir, `${job.id}.${meta.ext||'mp4'}`);
      await runCommand('yt-dlp', ['-o', filename, job.url]);
      job.state = 'done';
      job.result = { filePath: filename };
      persistJob(job);
      return job;
    }

    job.state = 'failed';
    job.log = 'No suitable formats found';
    persistJob(job);
    return job;

  }catch(err){
    job.state = 'error';
    job.log = err.message;
    persistJob(job);
    return job;
  }
}

async function workerLoop(){
  if(running) return;
  running = true;
  while(true){
    const job = queue.shift();
    if(!job){
      await new Promise(r=>setTimeout(r, 1000));
      continue;
    }
    await processJob(job);
  }
}

function startWorker(){
  workerLoop();
}

async function enqueueJob(url){
  const job = { id: uuidv4(), url, state: 'queued', createdAt: Date.now() };
  queue.push(job);
  persistJob(job);
  return job;
}

function getStatus(){
  return { queueLength: queue.length, running: running };
}

module.exports = { startWorker, enqueueJob, getStatus };
