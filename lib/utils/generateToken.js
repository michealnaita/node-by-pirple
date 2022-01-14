const helpers = require('./helpers');
const _data = require('../data');

function generateToken({ phone }, callback) {
  const tokenId = helpers.createRandomString(27);
  const expires = Date.now() + 3_600_000;
  const tokenObject = {
    id: tokenId,
    phone,
    expires,
  };
  if (tokenId) {
    _data.create('tokens', tokenId, tokenObject, (err) => {
      if (!err) {
        callback(false, tokenObject);
      } else {
        callback(new Error('failed to create token'));
      }
    });
  } else {
    callback(new Error('failed to create token'));
  }
}

module.exports = generateToken;
