const { spawn } = require('child_process');

function runCommand(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, opts);
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => stdout += d.toString());
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', code => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`Exit ${code}: ${stderr || stdout}`));
    });
  });
}

module.exports = { runCommand };
