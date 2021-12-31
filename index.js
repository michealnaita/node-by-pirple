/**
 * Primary file  for the API
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const _logger = require('./lib/logger');

const app = {};
app.start = () => {
  server.init();
  workers.init();
};
app.start();
module.exports = app;
