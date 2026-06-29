const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (opts) => ipcRenderer.invoke('save-file', opts),
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),

  printToPdf: (opts) => ipcRenderer.invoke('print-to-pdf', opts),

  restartAndInstall: () => ipcRenderer.invoke('restart-and-install'),
  forceQuit: () => ipcRenderer.invoke('force-quit'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  setTitle: (title) => ipcRenderer.invoke('set-title', title),
  confirmUnsaved: () => ipcRenderer.invoke('confirm-unsaved'),
  saveProject: (opts) => ipcRenderer.invoke('save-project', opts),
  openProject: () => ipcRenderer.invoke('open-project'),

  onUpdateAvailable: (cb) => {
    const handler = () => cb()
    ipcRenderer.on('update-available', handler)
    return () => ipcRenderer.removeListener('update-available', handler)
  },
  onUpdateDownloaded: (cb) => {
    const handler = () => cb()
    ipcRenderer.on('update-downloaded', handler)
    return () => ipcRenderer.removeListener('update-downloaded', handler)
  },
  onCloseRequested: (cb) => {
    const handler = () => cb()
    ipcRenderer.on('app-close-requested', handler)
    return () => ipcRenderer.removeListener('app-close-requested', handler)
  },
  onMenuNew: (cb) => {
    const handler = () => cb()
    ipcRenderer.on('menu-new', handler)
    return () => ipcRenderer.removeListener('menu-new', handler)
  },
  onMenuOpen: (cb) => {
    const handler = () => cb()
    ipcRenderer.on('menu-open', handler)
    return () => ipcRenderer.removeListener('menu-open', handler)
  },
  onMenuSave: (cb) => {
    const handler = () => cb()
    ipcRenderer.on('menu-save', handler)
    return () => ipcRenderer.removeListener('menu-save', handler)
  },
  onMenuSaveAs: (cb) => {
    const handler = () => cb()
    ipcRenderer.on('menu-save-as', handler)
    return () => ipcRenderer.removeListener('menu-save-as', handler)
  },
  onFileOpen: (cb) => {
    const handler = (event, payload) => cb(payload)
    ipcRenderer.on('open-file', handler)
    return () => ipcRenderer.removeListener('open-file', handler)
  },
})
