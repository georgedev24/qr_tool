const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let win = null

// Enforce single instance; hand off the file arg to the running instance
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}
app.on('second-instance', (event, argv) => {
  const file = findQrprojArg(isDev ? argv.slice(2) : argv.slice(1))
  if (file) sendOpenFile(file)
  if (win) { if (win.isMinimized()) win.restore(); win.focus() }
})

function findQrprojArg(args) {
  return args.find(a => a.endsWith('.qrproj') && fs.existsSync(a)) || null
}

function sendOpenFile(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    win?.webContents.send('open-file', { data, filePath })
  } catch {}
}

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, '../public/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#ffffff',
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Open file passed via file association on launch
  win.webContents.once('did-finish-load', () => {
    const fileArg = findQrprojArg(isDev ? process.argv.slice(2) : process.argv.slice(1))
    if (fileArg) sendOpenFile(fileArg)
  })

  // Intercept window close to allow renderer to handle unsaved changes
  win.on('close', (e) => {
    e.preventDefault()
    win.webContents.send('app-close-requested')
  })
}

app.whenReady().then(() => {
  createWindow()
  buildMenu()

  if (!isDev) {
    const { autoUpdater } = require('electron-updater')
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('update-available', () => {
      win?.webContents.send('update-available')
    })

    autoUpdater.on('update-downloaded', () => {
      win?.webContents.send('update-downloaded')
    })

    autoUpdater.checkForUpdates().catch(() => {})
  }
})

function buildMenu() {
  const checkForUpdates = {
    label: 'Check for Updates…',
    click: async () => {
      if (isDev) {
        dialog.showMessageBox(win, { type: 'info', title: 'Updates', message: 'Update checks are disabled in development mode.' })
        return
      }
      const { autoUpdater } = require('electron-updater')
      try {
        const result = await autoUpdater.checkForUpdates()
        if (!result?.updateInfo) throw new Error()
        if (result.updateInfo.version === app.getVersion()) {
          dialog.showMessageBox(win, { type: 'info', title: 'Up to date', message: `You're on the latest version (${app.getVersion()}).` })
        }
      } catch {
        dialog.showMessageBox(win, { type: 'error', title: 'Update check failed', message: 'Could not reach the update server.' })
      }
    },
  }

  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New Project',      accelerator: 'CmdOrCtrl+N',       click: () => win?.webContents.send('menu-new') },
        { type: 'separator' },
        { label: 'Open Project…',    accelerator: 'CmdOrCtrl+O',       click: () => win?.webContents.send('menu-open') },
        { label: 'Save Project',     accelerator: 'CmdOrCtrl+S',       click: () => win?.webContents.send('menu-save') },
        { label: 'Save Project As…', accelerator: 'CmdOrCtrl+Shift+S', click: () => win?.webContents.send('menu-save-as') },
        { type: 'separator' },
        checkForUpdates,
        { type: 'separator' },
        { role: 'quit', label: 'Exit' },
      ],
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      label: 'Help',
      submenu: [{ label: `QR Tool v${app.getVersion()}`, enabled: false }],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// --- File save (QR export) ---
ipcMain.handle('save-file', async (event, { buffer, defaultName, filters }) => {
  const { filePath } = await dialog.showSaveDialog({ defaultPath: defaultName, filters })
  if (!filePath) return { success: false }
  fs.writeFileSync(filePath, Buffer.from(buffer))
  shell.showItemInFolder(filePath)
  return { success: true, filePath }
})

// --- Window controls ---
ipcMain.handle('window-minimize', () => win?.minimize())
ipcMain.handle('window-maximize', () => { if (win?.isMaximized()) win.unmaximize(); else win?.maximize() })
ipcMain.handle('window-close', () => win?.close())
ipcMain.handle('force-quit', () => { app.exit(0) })

// --- Window title ---
ipcMain.handle('set-title', (event, title) => { win?.setTitle(title) })

// --- Unsaved changes dialog ---
ipcMain.handle('confirm-unsaved', async () => {
  const { response } = await dialog.showMessageBox(win, {
    type: 'question',
    buttons: ['Save', "Don't Save", 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    message: 'You have unsaved changes.',
    detail: 'Do you want to save your project before continuing?',
  })
  return response // 0 = Save, 1 = Don't Save, 2 = Cancel
})

// --- Project save ---
ipcMain.handle('save-project', async (event, { data, filePath }) => {
  let target = filePath
  if (!target) {
    const { filePath: chosen, canceled } = await dialog.showSaveDialog(win, {
      defaultPath: 'my-qr.qrproj',
      filters: [{ name: 'QR Project', extensions: ['qrproj'] }],
    })
    if (canceled || !chosen) return { success: false }
    target = chosen
  }
  fs.writeFileSync(target, JSON.stringify(data, null, 2), 'utf8')
  return { success: true, filePath: target }
})

// --- Project open ---
ipcMain.handle('open-project', async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog(win, {
    filters: [{ name: 'QR Project', extensions: ['qrproj'] }],
    properties: ['openFile'],
  })
  if (canceled || !filePaths.length) return null
  try {
    const raw = fs.readFileSync(filePaths[0], 'utf8')
    return { data: JSON.parse(raw), filePath: filePaths[0] }
  } catch {
    dialog.showErrorBox('Invalid file', 'Could not read the project file.')
    return null
  }
})

// --- Auto-updater ---
ipcMain.handle('restart-and-install', () => {
  if (!isDev) {
    const { autoUpdater } = require('electron-updater')
    autoUpdater.quitAndInstall()
  }
})

// --- WiFi card PDF ---
ipcMain.handle('print-to-pdf', async (event, { html }) => {
  const tempPath = path.join(app.getPath('temp'), `wifi-card-${Date.now()}.html`)
  let pdfWin = null
  try {
    fs.writeFileSync(tempPath, html, 'utf8')
    pdfWin = new BrowserWindow({ show: false, width: 600, height: 900, webPreferences: { contextIsolation: true } })
    await pdfWin.loadFile(tempPath)
    await pdfWin.webContents.executeJavaScript('new Promise(r => document.fonts.ready.then(() => setTimeout(r, 600)))')
    const pdfBuffer = await pdfWin.webContents.printToPDF({ pageSize: 'A5', printBackground: true, landscape: false, marginsType: 1 })
    return Array.from(pdfBuffer)
  } catch (err) {
    console.error('print-to-pdf error:', err)
    return null
  } finally {
    try { pdfWin?.destroy() } catch {}
    try { fs.unlinkSync(tempPath) } catch {}
  }
})
