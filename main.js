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
  win = new BrowserWindow({ height: 800, width: 600 })
  const indexPath = `file://${__dirname}/renderer/index.html`
  win.loadURL(indexPath)

  win.on('closed', () => { win = null })

  win.webContents.on('did-finish-load', () => {
    const server = net.createServer((socket) => {
      readline.createInterface({ input: socket }).on('line', (line) => {
        const message = JSON.parse(line)
        if (options.debug) console.log(message)
        win.webContents.send(message['type'], message)
      })
    })

    server.listen(options.port || 0, () => {
      console.log('Cucumber GUI listening for events on port ' + server.address().port)
    })
  })
})

