const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let win = null

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
        dialog.showMessageBox(win, {
          type: 'info',
          title: 'Updates',
          message: 'Update checks are disabled in development mode.',
        })
        return
      }
      const { autoUpdater } = require('electron-updater')
      try {
        const result = await autoUpdater.checkForUpdates()
        if (!result?.updateInfo) throw new Error('No response')
        const current = app.getVersion()
        const latest = result.updateInfo.version
        if (latest === current) {
          dialog.showMessageBox(win, {
            type: 'info',
            title: 'Up to date',
            message: `You're on the latest version (${current}).`,
          })
        }
        // If an update is available, the download starts automatically
        // and the in-app banner will appear
      } catch {
        dialog.showMessageBox(win, {
          type: 'error',
          title: 'Update check failed',
          message: 'Could not reach the update server. Check your internet connection.',
        })
      }
    },
  }

  const template = [
    {
      label: 'File',
      submenu: [
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
      submenu: [
        {
          label: `QR Tool v${app.getVersion()}`,
          enabled: false,
        },
      ],
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

// --- File save ---
ipcMain.handle('save-file', async (event, { buffer, defaultName, filters }) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: defaultName,
    filters,
  })
  if (!filePath) return { success: false }
  fs.writeFileSync(filePath, Buffer.from(buffer))
  shell.showItemInFolder(filePath)
  return { success: true, filePath }
})

// --- Window controls ---
ipcMain.handle('window-minimize', () => win?.minimize())
ipcMain.handle('window-maximize', () => {
  if (win?.isMaximized()) win.unmaximize()
  else win?.maximize()
})
ipcMain.handle('window-close', () => win?.close())

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

    pdfWin = new BrowserWindow({
      show: false,
      width: 600,
      height: 900,
      webPreferences: { contextIsolation: true },
    })

    await pdfWin.loadFile(tempPath)

    // Wait for fonts then give the renderer a beat to paint
    await pdfWin.webContents.executeJavaScript(
      'new Promise(r => document.fonts.ready.then(() => setTimeout(r, 600)))'
    )

    const pdfBuffer = await pdfWin.webContents.printToPDF({
      pageSize: 'A5',       // 148 × 210 mm
      printBackground: true,
      landscape: false,
      marginsType: 1,       // 1 = no margins
    })

    return Array.from(pdfBuffer)
  } catch (err) {
    console.error('print-to-pdf error:', err)
    return null
  } finally {
    try { pdfWin?.destroy() } catch {}
    try { fs.unlinkSync(tempPath) } catch {}
  }
})
