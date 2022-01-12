/**
 * helpers fr varius tasks
 */
// Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
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
// send an sms via twillio
helpers.sendTwillioSms = (phone, msg, callback) => {
  phone = typeof phone == 'string' && phone.length == 10 ? phone : false;
  msg =
    typeof msg == 'string' && msg.trim().length <= 1600 ? msg.trim() : false;
  if (phone && msg) {
    //config  the request payload
    const payload = new URLSearchParams({
      From: config.twilio.fromPhone,
      To: '+1' + phone,
      Body: msg,
    });

    const stringPayload = payload.toString();
    const requestDetails = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path:
        '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      auth: config.twilio.accountSid + ':' + config.twilio.authToken,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload),
      },
    };
    let str = '';
    const request = https.request(requestDetails, (res) => {
      const { statusCode } = res;
      if (statusCode == 200 || statusCode == 201) {
        callback(false);
      } else {
        callback('status code: ' + statusCode);
      }
    });
    // bind request with error handling
    request.on('error', (err) => {
      callback(err);
    });
    request.write(stringPayload);
    request.end();
  } else {
    callback('given parameters weere missing or invalid');
  }
};
helpers.getContentType = (filename) => {
  let contentType;
  const [_, ext] = filename.split('.');
  if (ext == 'png') {
    contentType = 'image/png';
  }
  if (ext == 'svg') {
    contentType = 'image/svg';
  }
  if (ext == 'jpg') {
    contentType = 'image/jpeg';
  }
  if (ext == 'html') {
    contentType = 'text/html';
  }
  if (ext == 'ico') {
    contentType = 'image/x-icon';
  }
  if (ext == 'js') {
    contentType = 'text/javascript (obsolete)';
  }
  if (ext == 'css') {
    contentType = 'text/css';
  }
  if (ext == 'svg') {
    contentType = 'image/svg+xml';
  }
  return contentType;
};
module.exports = helpers;
