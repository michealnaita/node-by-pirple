/**
 * helpers fr varius tasks
 */
// Dependencies
const crypto = require('crypto');
const config = require('./config');
const helpers = {};

helpers.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};
helpers.parseJsonToObject = (json) => {
  try {
    return JSON.parse(json);
  } catch {
    return false;
  }
};
helpers.createRandomString = (strLength) => {
  strLength =
    typeof strLength === 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    const possibleCharacters = 'abcdefghijklmnpqrstuvwxyz1234567890';
    let str = '';
    for (let i = 1; i <= strLength; i++) {
      const randomChar = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      str += randomChar;
    }
    return str;
  } else {
    return false;
  }
};
module.exports = helpers;
