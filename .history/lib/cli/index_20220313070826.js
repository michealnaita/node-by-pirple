const readline = require('readline');
const actions = require('actions.json');
const { list } = require('../data');

const cli = {};

list._parseInput = (input) => {
  const values = input.split(' ');
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

  cli._parseInput(input);
  /* Assert that user's inout is a supported actions */
  input = typeof string && Object.keys(actions).includes(input) ? input : false;
  if (!input) return;
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
