/**
 * Primary file for all request handlers
 */
// Dependencies
const checkHandlers = require('./api_handlers/checks');
const tokenHandlers = require('./api_handlers/tokens');
const userHandlers = require('./api_handlers/users');
const indexHandler = require('./static_handlers');

let handlers = {};

handlers.ping = (_, callback) => {
  callback(200);
};
handlers.notFound = (_, callback) => {
  callback(404);
};

handlers = {
  ...indexHandler,
  ...handlers,
  ...userHandlers,
  ...tokenHandlers,
  ...checkHandlers,
};
module.exports = handlers;
