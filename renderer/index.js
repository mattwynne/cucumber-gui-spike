const electron = require('electron')

// const Chart = require('chart.js')
// const Options = require('../cli/options')
// const options = new Options(electron.remote.process.argv)

window.jQuery = require('jquery')
require('bootstrap')

process.on('unhandledRejection', function (reason) {
  console.log(reason.message + '\\n' + reason.stack)
  electron.remote.process.exit(3)
})

const setProgress = (bar, states) => {
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
  document.getElementById('current-test-case').innerHTML =
    state.currentTestCase ? `${state.currentTestCase.location}` : 'Done'

  document.getElementById('current-test-step').innerHTML =
    state.currentTestStep ? `${state.currentTestStep.actionLocation}` : ''

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

  document.getElementById('test-case-summary').innerHTML =
    `${completedTestCases.length} / ${state.testCases.length} scenarios`

  const allTestSteps = state.testCases.reduce((result, testCase) => result.concat(testCase.testSteps), [])
  const completedTestSteps = allTestSteps.filter(testStep => testStep.result)

  document.getElementById('test-step-summary').innerHTML =
    `${completedTestSteps.length} / ${allTestSteps.length} steps`
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
  const lis = state.testCases.map(testCase => {
    const li = document.createElement('li')
    li.setAttribute('x-test-case-location', testCase.location)
    const name = document.createElement('h4')
    name.innerText = testCase.location
    li.appendChild(name)
    const steps = testCase.testSteps.map((testStep, index) => {
      const li = document.createElement('li')
      li.setAttribute('x-test-step-index', index)
      li.innerText = testStep.actionLocation
      return li
    })
    const stepsList = document.createElement('ul')
    steps.forEach(li => stepsList.appendChild(li))
    li.appendChild(stepsList)
    return li
  })
  lis.forEach(li => ul.appendChild(li))
  document.getElementById('main').appendChild(ul)
})

events.on('test-case-starting', (event, message) => {
  state.currentTestCase = state.getTestCase(message.location)
  render(state)
})

events.on('test-step-starting', (event, message) => {
  state.currentTestStep = state
    .getTestCase(message.testCase.location)
    .testSteps[message.index]
  render(state)
})

events.on('test-step-finished', (event, message) => {
  const testStep = state
    .getTestCase(message.testCase.location)
    .testSteps[message.index]
  testStep.result = message.result
  render(state)

  const testCaseLi = getTestCase(message.testCase.location)
  const li = testCaseLi.querySelector(`[x-test-step-index='${message.index}']`)
  li.className = message.result.status
  li.innerHTML += ` (${Math.ceil(message.result.duration / 1000000)}ms)`

  if (message.result.exception) {
    const error = document.createElement('pre')
    error.className = 'error'
    error.innerHTML = message.result.exception.message
    const stackTrace = document.createElement('ul')
    message.result.exception.stackTrace.forEach(line => {
      const li = document.createElement('li')
      li.innerText = line
      stackTrace.appendChild(li)
    })
    error.appendChild(stackTrace)
    li.appendChild(error)
  }
})

events.on('test-case-finished', (event, message) => {
  state.getTestCase(message.location).result = message.result
  render(state)

  const h4 = getTestCase(message.location).querySelector('h4')
  h4.className = message.result.status
  h4.innerHTML += ` (${Math.ceil(message.result.duration / 1000000)}ms)`
})

events.on('end', () => {
  state.currentTestCase = null
  state.currentTestStep = null
  render(state)
})