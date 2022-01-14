/**
 * these are the request handlers
 */
// Dependencies
const _data = require('../data');
const helpers = require('../utils/helpers.js');
const generateToken = require('../utils/generateToken');
const handlers = {};

//  TOKENS HANDLERS
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'delete', 'put'];
  if (acceptableMethods.includes(data.method)) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};
//
handlers._tokens = {};

// tokens/GET
// Required data: phone
// Optional data:None
handlers._tokens.get = (data, callback) => {
  // check that the phone number is valid
  const id =
    typeof data.queryStringObject.id === 'string' &&
    data.queryStringObject.id.length === 27
      ? data.queryStringObject.id
      : false;
  if (id) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, 'missing required field');
  }
};

// tokens/POST
// Required data: password,  phone
// Optional Data: None
handlers._tokens.post = (data, callback) => {
  // validate the submited password and phone
  const phone =
    typeof data.payload.phone === 'string' &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone
      : false;
  const password =
    typeof data.payload.password === 'string' &&
    data.payload.password.trim().length > 3
      ? data.payload.password
      : false;
  if (phone && password) {
    _data.read('users', phone, (err, userData) => {
      if (!err && data) {
        const hashedPassword = helpers.hash(password);

        //check if the submited password matchs the stred password
        if (hashedPassword === userData.hashedPassword) {
          generateToken({ phone }, (err, tokenData) => {
            if (!err && tokenData) {
              callback(200, tokenData);
            } else {
              callback(500, { error: 'failed to create token' });
            }
          });
        } else {
          callback(400, { error: 'password did not match the specified user' });
        }
      } else {
        callback(400, { error: 'could not find user' });
      }
    });
  } else {
    callback(400, { error: 'missing required fields' });
  }
};

// tokens/PUT
// Required field: id, extend
// Optional data: None
handlers._tokens.put = (data, callback) => {
  // check that the phone number is valid
  const id =
    typeof data.payload.id === 'string' && data.payload.id.length === 27
      ? data.payload.id
      : false;
  const extend =
    typeof data.payload.extend === 'boolean' && data.payload.extend == true
      ? true
      : false;
  if (id && extend) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        // Check that the token isnt already expired
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 3_600_000;
          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { error: "failed to extend token's expiration" });
            }
          });
        } else {
          callback(400, {
            error: 'the token has already expired and can not be extended',
          });
        }
      } else {
        callback(400, { error: 'specified token does not exist' });
      }
    });
  } else {
    callback(400, 'missing required field');
  }
};

//tokens/DELETE
// Required data: id
handlers._tokens.delete = (data, callback) => {
  // check that the id is valid
  const id =
    typeof data.queryStringObject.id === 'string' &&
    data.queryStringObject.id.length === 27
      ? data.queryStringObject.id
      : false;
  if (id) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { error: 'could not delete specified token' });
          }
        });
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, 'missing required field');
  }
};

// verify that a given token id is valid for the user
handlers._tokens.verifyToken = (id, phone, callback) => {
  _data.read('tokens', id, (err, tokenData) => {
    if (!err) {
      //check thata the tokens phone field matches the submited hone and that the token hasnt expired yet
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = handlers;
