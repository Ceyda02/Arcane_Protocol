const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('arcaneProtocol', Object.freeze({
  saveStorage: Object.freeze({
    readSave: () => ipcRenderer.invoke('save:read'),
    writeSave: (text) => ipcRenderer.invoke('save:write', text),
    clearSave: () => ipcRenderer.invoke('save:clear'),
  }),
}));
