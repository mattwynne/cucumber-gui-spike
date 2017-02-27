# cucumber-gui

Graphical User Interface for Cucumber, the BDD and testing tool.

You can test this using the `event-stream-2` branch of Cucumber-Ruby, using this command:

    cucumber features/docs/ --format Cucumber::Formatter::EventStream,port=9000 --out dev/null --format progress

<script src="//fast.wistia.com/embed/medias/hpf9qboi31.jsonp" async></script><script src="//fast.wistia.com/assets/external/E-v1.js" async></script><div class="wistia_responsive_padding" style="padding:56.25% 0 0 0;position:relative;"><div class="wistia_responsive_wrapper" style="height:100%;left:0;position:absolute;top:0;width:100%;"><div class="wistia_embed wistia_async_hpf9qboi31 videoFoam=true" style="height:100%;width:100%">&nbsp;</div></div></div>

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
- [ ] publish the repo and ask for help
- [ ] add tests
- [ ] use react / redux for rendering
- [ ] replace bootstrap / jquery with something lighter

### Ideas for additional features

- [ ] display multiple test runs (series) in different windows
  - [ ] group by project
- [ ] display project name and command used to run the tests
  - [ ] button to re-run the same test again

