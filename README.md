# cucumber-gui (spike)

A prototype Graphical User Interface for Cucumber, the BDD and testing tool.

Start it with `yarn start`

You can test this using the `event-stream-3` branch of Cucumber-Ruby, using this command:

    cucumber features/docs/ --format Cucumber::Formatter::EventStream,port=9000 --out dev/null --format progress

## Demo

[![Preview video](https://embed-ssl.wistia.com/deliveries/7bfcf5b0af9056385d1bf961194b17a9dee35580.jpg?image_crop_resized=400x225&image_play_button=true&image_play_button_color=D5D5D5CC)](https://cucumber.wistia.com/medias/hpf9qboi31)

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
- [ ] document new events in a PR for the event protocol with schema, examples etc

### Habitability

- [x] live reload for easier development
- [x] install bootstrap for better styling
  - [x] use bootstrap progress bar
- [ ] add to_json methods to things like Result and Test::Case/Step in cucumber-ruby-core
- [ ] publish the repo in cucumber/cucumber and ask for help
- [ ] add tests
- [ ] rewrite using react / redux for rendering
- [ ] replace bootstrap / jquery with something lighter

### Ideas for additional features

- [ ] display multiple test runs (series) in different windows
  - [ ] group by project
- [ ] display project name and command used to run the tests
  - [ ] button to re-run the same test again
