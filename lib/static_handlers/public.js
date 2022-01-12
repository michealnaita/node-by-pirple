const helpers = require('../helpers');
const templateEngine = require('../templateEngine');
const handlers = {};

handlers.public = (data, callback) => {
  const file = data.trimmedPath.replace('public', '');
  if (data.method == 'get') {
    templateEngine._getStatic(file, (err, fileContents) => {
      if (!err && fileContents) {
        const filename = file.split('/').pop();
        const contentType = helpers.getContentType(filename);
        callback(200, fileContents, contentType);
      } else {
        if (err.code == 'ENOENT') {
          callback(404, undefined, 'text/html');
        } else {
          callback(500, undefined, 'text/html');
        }
      }
    });
  } else {
    callback(405, undefined, 'text/html');
  }
};

module.exports = handlers;
