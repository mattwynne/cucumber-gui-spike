const electron = require('electron')

// const Chart = require('chart.js')
// const Options = require('../cli/options')
// const options = new Options(electron.remote.process.argv)

const $ = window.jQuery = require('jquery')
require('bootstrap')

process.on('unhandledRejection', function (reason) {
  console.log(reason.message + '\\n' + reason.stack)
  electron.remote.process.exit(3)
})

const setProgress = (bar, states) => {
  console.log(states)
  Object.keys(states).forEach((status) => {
    bar.getElementsByClassName(status)[0].style.width = `${states[status]}%`
  })
}

class State {
  constructor() {
    this.testCases = []
  }

  getTestCase(location) {
    return this.testCases.find(testCase => testCase.location == location)
  }
}
let state = new State()

const render = (state) => {
  document.getElementById('currentTestCase').innerHTML =
    state.currentTestCase ? `Running: ${state.currentTestCase.location}` : 'Done'

  const completedTestCases = state.testCases.filter(testCase => testCase.result)
  const completedTestCasesWithResult = (status) => {
    return completedTestCases.filter(testCase => testCase.result.status == status)
  }

  setProgress(
    document.getElementById('progressOfTestRun'),
    {
      passed: completedTestCasesWithResult('passed').length / state.testCases.length * 100,
      failed: completedTestCasesWithResult('failed').length / state.testCases.length * 100,
      pending: completedTestCasesWithResult('pending').length / state.testCases.length * 100,
    }
  )

  document.getElementById('summary').innerHTML = 
    `${completedTestCases.length} / ${state.testCases.length} scenarios`
}

const resetState = () => {
  document.getElementById('main').innerHTML = ''
  setProgress(
    document.getElementById('progressOfTestRun'),
    { passed: 0, failed: 0, skipped: 0, pending: 0 }
  )
}

const getTestCase = (location) => {
  return document.querySelector(`[x-test-case-location='${location}']`)
}

const events = electron.ipcRenderer

events.on('test-run-starting', (event, message) => {
  state = new State()
  render(state)
  resetState()

  state.testCases = message['testCases']

  const ul = document.createElement('ul')
  ul.innerHTML = state.testCases.map((testCase) =>
    `<li x-test-case-location="${testCase.location}">${testCase.location}</li>`).join('')
  document.getElementById('main').appendChild(ul)
})

events.on('test-case-starting', (event, message) => {
  state.currentTestCase = state.getTestCase(message.location)
  render(state)
})

events.on('test-case-finished', (event, message) => {
  state.getTestCase(message.location).result = message.result
  render(state)

  const li = getTestCase(message['location'])
  li.className = message['result']['status']
  li.innerHTML += ` (${message['result']['duration']})`
})

events.on('end', () => {
  state.currentTestCase = null
  render(state)
})