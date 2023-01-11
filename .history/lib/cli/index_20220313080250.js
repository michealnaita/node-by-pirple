const readline = require('readline');
// const actions = require('./actions.json');

const cli = {};

cli._parseInput = (input) => {
  input = typeof string ? input : false;
  if (!input) throw new Error('could not parse input');

  const parsedInput = {};

  // users [options] [other]
  const values = input.split(' ');
  parsedInput.action = values[0];

  // test for options supplied
  parsedInput.options = values.filter(
    (str) => /-(-)?\w+/.test(str) && /^=+/.test(str)
  );

  //test for key value pairs supplied
  parsedInput.pairs = [];
  values.forEach((str) => {
    if (/--\w+=\w+/.test(str)) {
      parsedInput.pairs.push(str.split('='));
    }
  });
  parsedInput.arg = values.filter(
    (str, i) => /^(-(-)?w+)/.test(str) && i > 1
  )[0];
  return parsedInput;
};

cli._processInput = (input) => {
  //
  /**
   * get users
   * get checks
   * help / man
   * get logs
   * shut down
   * stats
   */

  input = cli._parseInput(input);
  //   input = typeof string && Object.keys(actions).includes(input) ? input : false;
  //   if (!input) return;
  /* Assert that user's inout is a supported actions */
  console.log(input);
};
cli.init = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '',
  });
  rl.prompt();
  rl.on('line', cli._processInput);
};

module.exports = cli;
