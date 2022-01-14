/**
 * Primary file  for the API
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/utils/workers');

const app = {};
app.start = () => {
  server.init();
  workers.init();
};
app.start();
module.exports = app;
