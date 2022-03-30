/**
 * Primary file  for the API
 */

// Dependencies
const server = require("./lib/server");
const workers = require("./lib/utils/workers");
const config = require("./lib/config");
const cli = require("./lib/cli");

const app = {};
app.start = () => {
  server.init();
  if (["testing", "production", "staging"].includes(config.envName))
    workers.init();
  console.log("server in " + config.envName + " mode");
  cli.init();
};
app.start();
module.exports = app;
