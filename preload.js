const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  enqueueJob: (payload) => ipcRenderer.invoke('enqueue-job', payload),
  getStatus: () => ipcRenderer.invoke('get-status')
});
