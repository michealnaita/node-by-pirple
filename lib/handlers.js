/**
 * these are the request handlers
 */
// Dependencies
const _data = require('./data');
const helpers = require('./helpers.js');
const handlers = {};

handlers.ping = (_, callback) => {
  callback(200);
};
handlers.notFound = (_, callback) => {
  callback(404);
};

// USERS HANDLERS
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
// TODO: only allow authenticated users access there data
handlers._users.get = (data, callback) => {
  // check that the phone number is valid
  const phone =
    typeof data.queryStringObject.phone === 'string' &&
    data.queryStringObject.phone.length === 10
      ? data.queryStringObject.phone
      : false;
  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
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
              callback(200);
            } else {
              console.group(err);
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
      callback(400, { error: 'missing fields to update' });
    }
  } else {
    callback(400, 'missing required field');
  }
};

// users/DELETE
// Required data: phone number
// OPtional data: none
// TODO: only allow authenticated user to delete only there data
// TODO: delete any other filed rdelated to user
handlers._users.delete = (data, callback) => {
  // check that the phone number is valid
  const phone =
    typeof data.queryStringObject.phone === 'string' &&
    data.queryStringObject.phone.length === 10
      ? data.queryStringObject.phone
      : false;
  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        _data.delete('users', phone, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { error: 'could not delete user' });
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
                callback(200, tokenObject);
              } else {
                callback(500, { error: 'failed to create token' });
              }
            });
          } else {
            callback(500, { error: 'failed to create tokenId' });
          }
        } else {
          callback(400, { error: 'password did not match the specified user' });
        }
      } else {
        callback(400, { error: 'could not find user' });
      }
    });
  } else {
    callback(400, { error: 'missin required fields' });
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
module.exports = handlers;
