const path = require('path')
const url = require('url')
const net = require('net')
const readline = require('readline')
const { app, BrowserWindow, ipcMain } = require('electron')
app.commandLine.appendSwitch('--disable-http-cache')

const Options = require('./cli/options')
const options = new Options(process.argv)

let win

app.on('ready', () => {
  win = new BrowserWindow({
    height: 800,
    width: 600,
    focusable: true,
    show: true,
    webPreferences: { webSecurity: false }
  })

  const indexPath = url.format({
    pathname: path.join(__dirname, 'renderer', 'index.html'),
    protocol: 'file:',
    slashes: true
  })
  win.loadURL(indexPath)
  win.webContents.openDevTools()

  win.on('closed', () => { win = null })

  win.webContents.on('did-finish-load', () => {
    const server = net.createServer((socket) => {
      readline.createInterface({ input: socket }).on('line', (line) => {
        const message = JSON.parse(line)
        console.log("received", message)
        win.webContents.send(message['type'], message)
      })
    })

    server.listen(options.port || 0, () => {
      console.log('Cucumber GUI listening for events on port ' + server.address().port)
    })
  })
})

