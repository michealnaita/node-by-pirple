/**
 * Primary file  for the API
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/utils/workers');
const config = require('./lib/config');

const app = {};
app.start = () => {
  server.init();
  if (['testing', 'production', 'stages'].includes(config.envName))
    workers.init();
};
app.start();
module.exports = app;
