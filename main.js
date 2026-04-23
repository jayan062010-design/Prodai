const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    title: 'AURA',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  })
  win.loadFile('index.html')
  // Set title after load
  win.webContents.on('did-finish-load', () => {
    win.setTitle('AURA')
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
