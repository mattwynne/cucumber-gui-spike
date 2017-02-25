const electron = require('electron')
const moment = require('moment')

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
  Object.keys(states).forEach((status) => {
    bar.getElementsByClassName(status)[0].style.width = `${states[status]}%`
  })
}

class State {
  constructor() {
    this.testCases = []
    this.gherkinDocs = {}
  }

  getTestCase(location) {
    return this.testCases.find(testCase => testCase.location == location)
  }
}
let state = new State()

const render = (state) => {
  $('.status-waiting').hide()
  $('.status-started').show()

  document.getElementsByClassName('pwd')[0].innerText = state.pwd
  document.getElementsByClassName('start-time')[0].innerText = moment(state.startTime).format('h:mm:ss a on MMMM Do YYYY')

  if (!state.currentTestCase) {
    $('.status-done').show()
    $('.status-running').hide()
  } else {
    $('.status-done').hide()
    $('.status-running').show()
  }
  document.getElementById('current-test-case').innerHTML =
    state.currentTestCase && `${state.currentTestCase.location}`

  document.getElementById('current-test-step').innerHTML =
    state.currentTestStep && `${state.currentTestStep.actionLocation}`

  const completedTestCases = state.testCases.filter(testCase => testCase.result)
  $('.test-cases-finished-count').text(completedTestCases.length)
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

  const allTestSteps = state.testCases.reduce((result, testCase) => result.concat(testCase.testSteps), [])
  const completedTestSteps = allTestSteps.filter(testStep => testStep.result)
  $('.test-steps-finished-count').text(completedTestSteps.length)
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

events.on('start', () => state = new State())

require('gherkin')
const Gherkin = window.Gherkin
const parser = new Gherkin.Parser(new Gherkin.AstBuilder())

events.on('gherkin-source-read', (event, message) => {
  state.gherkinDocs[message.path] = {
    body: message.body,
    ast: parser.parse(message.body),
  }
})

events.on('test-run-starting', (event, message) => {
  state.pwd = message.workingDirectory
  state.startTime = message.timestamp * 1000
  render(state)

  resetState()
  state.testCases = message.testCases

  state.testCases.forEach(testCase => {
    const div = document.createElement('div')

    div.setAttribute('x-test-case-location', testCase.location)
    const h2 = document.createElement('h2')
    h2.innerText = testCase.location
    div.appendChild(h2)

    const p = document.createElement('p')
    p.innerText = `This scenario has ${testCase.testSteps.length} steps:`
    div.appendChild(p)

    const ul = document.createElement('ul')
    testCase.testSteps.forEach((testStep, index) => {
      const li = document.createElement('li')
      li.setAttribute('x-test-step-index', index)
      li.innerHTML = getStepHtml(testStep)
      ul.appendChild(li)
    })
    div.appendChild(ul)

    document.getElementById('main').appendChild(div)
  })
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

  const div = getTestCase(message.testCase.location)
  const li = div.querySelector(`[x-test-step-index='${message.index}']`)
  li.appendChild(createResultBadge(message.result))
  li.appendChild(createDurationBadge(message.result))

  if (message.result.exception) {
    const error = document.createElement('pre')
    error.className = 'alert alert-danger'
    error.innerHTML = message.result.exception.message || 'No error message was reported'
    li.appendChild(error)
    const stackTrace = document.createElement('pre')
    stackTrace.innerText = message.result.exception.stackTrace.join('\n')
    li.appendChild(stackTrace)
  }
})

events.on('test-case-finished', (event, message) => {
  state.getTestCase(message.location).result = message.result
  render(state)

  const div = getTestCase(message.location)
  const h2 = div.querySelector('h2')
  h2.appendChild(createResultBadge(message.result))
  h2.appendChild(createDurationBadge(message.result))
})

events.on('end', () => {
  state.currentTestCase = null
  state.currentTestStep = null
  render(state)
})

const createResultBadge = (result) => {
  const badge = document.createElement('span')
  badge.className = `badge ${result.status}`
  badge.innerText = result.status
  return badge
}

const createDurationBadge = (result) => {
  const badge = document.createElement('span')
  badge.className = 'badge'
  badge.innerText = `${Math.ceil(result.duration / 1000000)}ms`
  return badge
}

const getStepHtml = (testStep) => {
  if (!testStep.sourceLocation)
    return testStep.actionLocation

  const file = testStep.sourceLocation.split(':')[0]
  const line = testStep.sourceLocation.split(':')[1]
  const text = state.gherkinDocs[file].body.split('\n')[line - 1]
  return `<span title="${testStep.actionLocation}" data-toggle="tooltip" data-placement="right">${text}</span>`
}