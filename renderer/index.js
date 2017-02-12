require('./patches/console')
require('./keyboard/bindings')

const electron = require('electron')

const Options = require('../cli/options')

const options = new Options(electron.remote.process.argv)

process.on('unhandledRejection', function (reason) {
  output.write(reason.message + '\\n' + reason.stack)
  exitWithCode(3)
})

function exitWithCode(code) {
  if (!options.electronDebug) electron.remote.process.exit(code)
}

const { ipcRenderer } = require('electron')
ipcRenderer.on('test-run-started', (event, message) => {
  const testCases = document.createElement('ul')
  testCases.innerHTML = message['testCases'].map((file) => 
    `<li x-test-case-location="${file}">${file}</li>`).join('')
  main.appendChild(testCases)
})

ipcRenderer.on('test-case-finished', (event, message) => {
  const li = document.querySelector(`[x-test-case-location='${message['location']}']`)
  li.className = message['result']
})

