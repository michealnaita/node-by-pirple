const readline = require('readline');

const cli = {};
cli.init = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.prompt();
  rl.on('line', (userInput) => {
    console.log('you wrote: ', userInput);
  });
};

module.exports = cli;
