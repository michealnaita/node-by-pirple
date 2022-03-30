const readline = require('readline');

const cli = {};
cli.processInput = () => {
  //
  /**
   * get users
   * get checks
   * help / man
   * get logs
   * shut down
   * stats
   */
};
cli.init = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '',
  });
  rl.prompt();
  rl.on('line', (userInput) => {
    console.warn('you wrote: ', userInput);
  });
};

module.exports = cli;
