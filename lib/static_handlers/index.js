const helpers = require('../helpers');
const templateEngine = require('../templateEngine');

const handlers = {};

handlers.index = (data, callback) => {
  if (data.method == 'get') {
    templateEngine.render(
      'index',
      {
        pageTitle: 'Uptime Tracker',
        pageDescription:
          'Uptime tracker alows you to tracker your webites uptime and prevent downtimes',
      },
      (err, page) => {
        if (!err && page) {
          callback(200, page, 'text/html');
        } else {
          callback(500, undefined, 'text/html');
        }
      }
    );
  } else {
    callback(405, undefined, 'text/html');
  }
};

handlers.createAccount = (data, callback) => {
  if (data.method == 'get') {
    templateEngine.render(
      'signup',
      {
        pageTitle: 'Create Account',
        pageDescription:
          'create your uptime tracker account today and tracker your website uptime',
      },
      (err, page) => {
        if (!err && page) {
          callback(200, page, 'text/html');
        } else {
          callback(500, undefined, 'text/html');
        }
      }
    );
  } else {
    callback(405, undefined, 'text/html');
  }
};
handlers.createSession = (data, callback) => {
  if (data.method == 'get') {
    templateEngine.render(
      'signin',
      {
        pageTitle: 'Sign in | Uptime Tracker',
        pageDescription: 'sign in to use your webiste uptime tracker',
      },
      (err, page) => {
        if (!err && page) {
          callback(200, page, 'text/html');
        } else {
          callback(500, undefined, 'text/html');
        }
      }
    );
  } else {
    callback(405, undefined, 'text/html');
  }
};
handlers.checksList = (data, callback) => {
  if (data.method == 'get') {
    templateEngine.render(
      'checks',
      {
        pageTitle: 'Dashboard | Uptime Tracker',
      },
      (err, page) => {
        if (!err && page) {
          callback(200, page, 'text/html');
        } else {
          callback(500, undefined, 'text/html');
        }
      }
    );
  } else {
    callback(405, undefined, 'text/html');
  }
};

module.exports = handlers;
