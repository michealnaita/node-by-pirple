/**
 * Primary file for all request handlers
 */
// Dependencies
const checkHandlers = require('./api_handlers/checks');
const tokenHandlers = require('./api_handlers/tokens');
const userHandlers = require('./api_handlers/users');
const indexHandler = require('./static_handlers');
const publicHandler = require('./static_handlers/public');

let handlers = {};
handlers = {
  ...indexHandler,
  ...handlers,
  ...userHandlers,
  ...tokenHandlers,
  ...checkHandlers,
  ...publicHandler,
};

handlers.ping = (_, callback) => {
  callback(200);
};
handlers.notFound = (_, callback) => {
  callback(404);
};

handlers.favicon = (data, callback) => {
  data.trimmedPath = 'public/images/favicon.ico';
  handlers.public(data, callback);
};
module.exports = handlers;
