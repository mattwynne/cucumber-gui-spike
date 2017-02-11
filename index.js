const { join, resolve } = require('path')
const window = require('electron-window')
const { app } = require('electron')
app.commandLine.appendSwitch('--disable-http-cache')

const Options = require('./cli/options')
const options = new Options(process.argv)

let win

app.on('ready', () => {
  win = window.createWindow({
    height: 800,
    width: 600,
    focusable: true,
    show: true,
    webPreferences: { webSecurity: false }
  })

  if (!options.electronDebug && process.platform === 'darwin') {
    app.dock.hide()
  }

  const indexPath = resolve(join(__dirname, 'renderer/index.html'))
  // undocumented call in electron-window
  win._loadURLWithArgs(indexPath, {}, () => {})
})
