/**
 * these are the USERS SERVICE request handlers
 */
// Dependencies
const _data = require('../data');
const helpers = require('../utils/helpers.js');
const generateToken = require('../utils/generateToken');
const handlers = {};

const verifyToken = require('./tokens')._tokens.verifyToken;

handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'delete', 'put'];
  if (acceptableMethods.includes(data.method)) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};
// Container for the users submethods
handlers._users = {};

// users/GET
// Required data: phone number
// OPtional data: none
handlers._users.get = (data, callback) => {
  // check that the phone number is valid
  const phone =
    typeof data.queryStringObject.phone == 'string' &&
    data.queryStringObject.phone.length == 10
      ? data.queryStringObject.phone
      : false;
  if (phone) {
    const token =
      typeof data.headers.token == 'string' ? data.headers.token : false;
    // Verify the submited token with phone
    verifyToken(token, phone, (isTokenValid) => {
      if (isTokenValid) {
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, { error: 'invalid token' });
      }
    });
  } else {
    callback(400, 'missing required field');
  }
};

// users/POST
// Required data: firstname, lastname, phone, password, tosAgreement
// Optional data:none
handlers._users.post = (data, callback) => {
  //Check that all athe required fields are filled out
  const firstname =
    typeof data.payload.firstname === 'string' &&
    data.payload.firstname.trim().length > 0
      ? data.payload.firstname
      : false;
  const lastname =
    typeof data.payload.lastname === 'string' &&
    data.payload.lastname.trim().length > 0
      ? data.payload.lastname
      : false;
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
  const tosAgreement =
    typeof data.payload.tosAgreement === 'boolean' && data.payload.tosAgreement
      ? true
      : false;
  if (firstname && lastname && phone && tosAgreement) {
    //make sure that the usrs doent already exist
    _data.read('users', phone, (err, data) => {
      if (!err) {
        callback(400, {
          error: ' a user  with the specified phone  already exists',
        });
      } else {
        const hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          const userObject = {
            firstname,
            lastname,
            phone,
            hashedPassword,
            tosAgreement,
          };
          _data.create('users', phone, userObject, (err) => {
            if (!err) {
              generateToken({ phone }, (err, tokenData) => {
                if (!err && tokenData) {
                  callback(200, tokenData);
                } else {
                  callback(500, { error: 'failed to create access token' });
                }
              });
            } else {
              console.log(err);
              callback(500, { error: 'could not create the new user' });
            }
          });
        } else {
          callback(500, { error: 'could not hash user password' });
        }
      }
    });
  } else {
    callback(400, { error: 'missing required filled' });
  }
};

// users/PUT
// Required data: phone
// Optional data: firstname, lastname, password
handlers._users.put = (data, callback) => {
  const phone =
    typeof data.payload.phone === 'string' && data.payload.phone.length === 10
      ? data.payload.phone
      : false;
  const firstname =
    typeof data.payload.firstname === 'string' &&
    data.payload.firstname.trim().length > 0
      ? data.payload.firstname
      : false;
  const lastname =
    typeof data.payload.lastname === 'string' &&
    data.payload.lastname.trim().length > 0
      ? data.payload.lastname
      : false;
  const password =
    typeof data.payload.password === 'string' &&
    data.payload.password.trim().length > 3
      ? data.payload.password
      : false;
  // check for phone
  if (phone) {
    // check for optional fields
    if (firstname || lastname || password) {
      const token =
        typeof data.headers.token == 'string' ? data.headers.token : false;
      // Verify the submited token with phone
      verifyToken(token, phone, (isTokenValid) => {
        if (isTokenValid) {
          // check if user with phone number exists
          _data.read('users', phone, (err, userData) => {
            if (firstname) userData.firstname = firstname;
            if (firstname) userData.lastname = lastname;
            if (password) userData.hashedPassword = helpers.hash(password);
            if (!err && userData) {
              _data.update('users', phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  console.log('error: ', err);
                  callback(500, { error: 'failed to  update users' });
                }
              });
            } else {
              callback(400, {
                error: 'user with specified phone number does not exist',
              });
            }
          });
        } else {
          callback(403, { error: 'invalid token' });
        }
      });
    } else {
      callback(400, { error: 'missing fields to update' });
    }
  } else {
    callback(400, 'missing required field');
  }
};

// users/DELETE
// Required data: phone number
// OPtional data: none
handlers._users.delete = (data, callback) => {
  // check that the phone number is valid
  const phone =
    typeof data.queryStringObject.phone === 'string' &&
    data.queryStringObject.phone.length === 10
      ? data.queryStringObject.phone
      : false;
  if (phone) {
    const token =
      typeof data.headers.token == 'string' ? data.headers.token : false;
    // Verify the submited token with phone
    verifyToken(token, phone, (isTokenValid) => {
      if (isTokenValid) {
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            _data.delete('users', phone, (err) => {
              if (!err) {
                // delete all the checks associated with the user
                if (userData.checks && userData.checks.length > 0) {
                  userData.checks.forEach((check) => {
                    _data.delete('checks', check, (err) => {
                      if (err) {
                        callback(500, {
                          error: 'failed to delete the check with id: ' + check,
                        });
                      }
                    });
                    callback(200);
                  });
                } else {
                  callback(200);
                }
              } else {
                callback(500, { error: 'could not delete user' });
              }
            });
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, { error: 'invalid token' });
      }
    });
  } else {
    callback(400, 'missing required field');
  }
};

module.exports = handlers;
