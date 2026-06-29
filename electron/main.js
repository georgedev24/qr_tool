const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
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

  try {
    fs.writeFileSync(tempPath, html, 'utf8')

    const pdfWin = new BrowserWindow({
      show: false,
      webPreferences: { contextIsolation: true },
    })

    await pdfWin.loadFile(tempPath)

    // Wait for web fonts to finish loading before printing
    await pdfWin.webContents.executeJavaScript('document.fonts.ready')

    const pdfBuffer = await pdfWin.webContents.printToPDF({
      pageSize: { width: 148000, height: 210000 }, // microns: 148mm × 210mm
      printBackground: true,
      margins: { marginType: 'none' },
    })

    pdfWin.destroy()
    return Array.from(pdfBuffer)
  } catch (err) {
    console.error('print-to-pdf error:', err)
    return null
  } finally {
    try { fs.unlinkSync(tempPath) } catch {}
  }
})
