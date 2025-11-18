import React, { useEffect, useState } from 'react';

export default function App(){
  const [url, setUrl] = useState('');
  const [jobs, setJobs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rtg_jobs')||'[]') } catch { return []; }
  });
  const [status, setStatus] = useState({});

  useEffect(()=>{
    const t = setInterval(async ()=>{
      try{
        const s = await window.electronAPI.getStatus();
        setStatus(s);
      }catch(e){}
    }, 1500);
    return ()=>clearInterval(t);
  },[]);

  function saveJobs(next){
    localStorage.setItem('rtg_jobs', JSON.stringify(next));
    setJobs(next);
  }

  async function submit(){
    if(!url) return alert('Paste a URL first');
    try{
      const res = await window.electronAPI.enqueueJob({url});
      const newJob = { id: res.id || res.jobId || 'local-'+Date.now(), url, state: 'queued', createdAt: Date.now() };
      saveJobs([newJob, ...jobs]);
      setUrl('');
    }catch(err){
      alert('Failed to enqueue job: '+err.message);
    }
  }

  return (
    <div className="container">
      <h1>Reloadthegraphics — Local</h1>
      <p>Paste a media page URL. Extraction runs locally using yt-dlp + ffmpeg.</p>
      <div className="form">
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." />
        <button onClick={submit}>Extract</button>
      </div>
      <div className="status">
        <h3>Worker status</h3>
        <pre>{JSON.stringify(status, null, 2)}</pre>
      </div>
      <div className="jobs">
        <h3>Jobs (local history)</h3>
        <ul>
          {jobs.map(j=> (
            <li key={j.id}>
              <strong>{j.url}</strong> — {j.state} — {new Date(j.createdAt).toLocaleString()}
              <div>{j.result ? <a href={'file://'+j.result.filePath} target="_blank" rel="noreferrer">Open file</a> : j.log}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
