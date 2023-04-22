const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')

const template = []
const menu = Menu.buildFromTemplate(template)

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  })

  win.loadFile('index.html')

  // prevent reload
  // win.setMenu(menu)

  //ipc
  ipcMain.on('closeWindow', () => {
    win.close()
  })
  ipcMain.on('minimizeWindow', () => {
    win.minimize()
  })
  ipcMain.on('restoreWindow', () => {
    win.isMaximized() ? win.restore() : win.maximize()
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
