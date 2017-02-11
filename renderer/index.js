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

const testCases = document.createElement('ul')
testCases.innerHTML = "<li>features/foo.feature:1</li>"
main.appendChild(testCases)
