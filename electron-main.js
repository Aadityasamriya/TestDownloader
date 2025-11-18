const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { startWorker, enqueueJob, getStatus } = require('./node-services/worker');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  startWorker();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('enqueue-job', async (event, payload) => {
  const job = await enqueueJob(payload.url);
  return job;
});

ipcMain.handle('get-status', async () => {
  return getStatus();
});
