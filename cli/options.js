const commander = require('commander')

class Options {
  constructor(argv) {
    const args = commander
      .option('-p, --port <n>', 'Port to listen for events on', parseInt)
      .parse(argv)

    this.port = args.port
  }
}

module.exports = Options
