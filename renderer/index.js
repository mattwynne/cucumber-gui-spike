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
    return this.testCases.find(
      testCase => (testCase.uri == location.uri && testCase.locations[0].line == location.line)
    )
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
    state.currentTestCase && `${state.currentTestCase.uri}:${state.currentTestCase.locations[0].line}`

  document.getElementById('current-test-step').innerHTML =
    state.currentTestStep && `${state.currentTestStep.locations[0].uri || state.currentTestCase.uri}:${state.currentTestStep.locations[0].line}`

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

  const allTestSteps = state.testCases.reduce((result, testCase) => result.concat(testCase.steps), [])
  const completedTestSteps = allTestSteps.filter(step => step.result)
  $('.test-steps-finished-count').text(completedTestSteps.length)
}

const resetState = () => {
  document.getElementById('main').innerHTML = ''
  setProgress(
    document.getElementById('progressOfTestRun'),
    { passed: 0, failed: 0, skipped: 0, pending: 0 }
  )
}

const getTestCaseDiv = (location) => {
  return document.querySelector(`[x-test-case-location='${location}']`)
}

const events = electron.ipcRenderer

//   state.pwd = message.workingDirectory
events.on('start', () => {
  state = new State()
  state.startTime = new Date()
  render(state)

  resetState()
})

require('gherkin')
const Gherkin = window.Gherkin
const parser = new Gherkin.Parser(new Gherkin.AstBuilder())

events.on('source', (event, message) => {
  state.gherkinDocs[message.uri] = {
    body: message.data,
    ast: parser.parse(message.data),
  }
})

events.on('pickle', (event, message) => {
  message.pickle.uri = message.uri
  state.testCases.push(message.pickle)
  const location = `${message.pickle.locations[0].uri || message.uri}:${message.pickle.locations[0].line}`

  const div = document.createElement('div')

  div.setAttribute('x-test-case-location', location)
  const h2 = document.createElement('h2')
  h2.innerText = location
  div.appendChild(h2)

  const p = document.createElement('p')
  p.innerText = `This scenario has ${message.pickle.steps.length} steps:`
  div.appendChild(p)

  const ul = document.createElement('ul')
  message.pickle.steps.forEach((step, index) => {
    const li = document.createElement('li')
    li.setAttribute('x-test-step-index', index)
    li.innerHTML = getStepHtml(step, message.uri)
    ul.appendChild(li)
  })
  div.appendChild(ul)

  document.getElementById('main').appendChild(div)
})

const getLocationFromString = (locationString => {
  const uri = locationString.split(':')[0]
  const line = locationString.split(':')[1]
  return { uri, line }
})

events.on('test-case-starting', (event, message) => {
  state.currentTestCase = state.getTestCase(getLocationFromString(message.location))
  render(state)
})

events.on('test-step-starting', (event, message) => {
  state.currentTestStep = state
    .getTestCase(getLocationFromString(message.testCase.location))
    .steps[message.index]
  render(state)
})

events.on('test-step-finished', (event, message) => {
  const testStep = state
    .getTestCase(getLocationFromString(message.testCase.location))
    .steps[message.index]
  testStep.result = message.result
  render(state)

  const div = getTestCaseDiv(message.testCase.location)
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
  state.getTestCase(getLocationFromString(message.location)).result = message.result
  render(state)

  const div = getTestCaseDiv(message.location)
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

const getStepHtml = (step, uri) => {
  if (step.locations[0].uri)
    return `${step.locations[0].uri}:${step.locations[0].line}`

  const line = step.locations[0].line
  const text = state.gherkinDocs[uri].body.split('\n')[line - 1]
  return `<span title="${step.locations[1].uri}:${step.locations[1].line}" data-toggle="tooltip" data-placement="right">${text}</span>`
}