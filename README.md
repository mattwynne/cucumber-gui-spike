# cucumber-gui

Graphical User Interface for Cucumber, the BDD and testing tool.


## TODO

### Protocol

- [x] count steps as they're executed
  - [x] resolve mystery of why steps appear from Ruby after test run started event
  - [x] resolve the mystery of why some steps that were shown in the test-run-starting event are never sent us as results
- [x] display step duration
- [x] show which step is curently running (drives out the test-step-starting event)
- [x] display test step failure message and backtrace
- [x] hide things until they're ready to display
- [x] display working directory
- [x] display start time
- [x] display Gherkin source of a test case
  - [x] send a GherkinSourceRead event
  - [x] highlight steps from Gherkin source as they're executed
- [ ] display unused step definitions
- [ ] resolve confusion about sourceLocation vs actionLocation for test steps (especially hooks)
- [ ] protocol version
- [ ] display image / video attachments
- [ ] publish Ruby event-stream formatter / plugin (with tests?)

### Additional features

- [ ] display multiple test runs in different windows
- [ ] display project name and command used to run the tests
  - [ ] button to re-run the same test again
- [ ] document new events in a PR for the event protocol with schema, examples etc
- [ ] add to_json methods to things like Result and Test::Case/Step in core?
- [ ] publish the repo and ask for help

### Habitability

- [x] live reload for easier development
- [x] install bootstrap for better styling
  - [x] use bootstrap progress bar
- [ ] add tests
- [ ] use react / redux for rendering
- [ ] replace bootstrap / jquery with something lighter
