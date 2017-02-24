# cucumber-gui

Graphical User Interface for Cucumber, the BDD and testing tool.


## TODO

- [x] live reload for easier development
- [x] install bootstrap for better styling
  - [x] use bootstrap progress bar
  - [x] use bootstrap grid
- [x] count steps as they're executed
  - [x] resolve mystery of why steps appear from Ruby after test run started event
  - [x] resolve the mystery of why some steps that were shown in the test-run-starting event are never sent us as results
- [x] display step duration
- [x] show which step is curently running (drives out the test-step-starting event)
- [ ] display test case failure message and backtrace
- [ ] display Gherkin source of a test case
  - [ ] send a GherkinSourceRead event
  - [ ] highlight steps from Gherkin source as they're executed
- [ ] display multiple test runs in different windows
- [ ] display project name / dir and command used to run the tests
- [ ] button to re-run the same test again
- [ ] breakdown count of test cases passed / failed / pending etc
- [ ] resolve confusion about sourceLocation vs actionLocation for test steps (especially hooks)
- [ ] document new events in a PR for the event protocol with schema, examples etc
- [ ] add to_json methods to things like Result and Test::Case/Step in core
- [ ] publish Ruby event-stream formatter / plugin (with tests?)
- [ ] hide things until they're ready to display
- [ ] publish the repo and ask for help on the ML

