/**
 * these are the request handlers
 */
// Dependencies
const _data = require('./data');
const helpers = require('./helpers.js');
const handlers = {};
const config = require('./config');

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
    handlers._tokens.verifyToken(token, phone, (isTokenValid) => {
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
      const token =
        typeof data.headers.token == 'string' ? data.headers.token : false;
      // Verify the submited token with phone
      handlers._tokens.verifyToken(token, phone, (isTokenValid) => {
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
    handlers._tokens.verifyToken(token, phone, (isTokenValid) => {
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

// CHECKS SERVICE
handlers.checks = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'delete', 'put'];
  if (acceptableMethods.includes(data.method)) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};
// checks method handlers
handlers._checks = {};

// checkc/GET
// Required Data: id
// Optional data: None
handlers._checks.get = (data, callback) => {
  // check that the phone number is valid
  const checkId =
    typeof data.queryStringObject.id == 'string' &&
    data.queryStringObject.id.length == 20
      ? data.queryStringObject.id
      : false;
  const phone =
    typeof data.queryStringObject.phone == 'string' &&
    data.queryStringObject.phone.length == 10
      ? data.queryStringObject.phone
      : false;
  if (checkId && phone) {
    const token =
      typeof data.headers.token == 'string' ? data.headers.token : false;
    // Verify the submited token with phone
    handlers._tokens.verifyToken(token, phone, (isTokenValid) => {
      if (isTokenValid) {
        _data.read('checks', checkId, (err, checkData) => {
          if (!err && data) {
            if (checkData.userPhone == phone) {
              callback(200, checkData);
            } else {
              callback(403, { error: 'check does belong to user' });
            }
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
// checkc/POST
// Required data: protocol, url, method, successCodes, timeoutSeconds
handlers._checks.post = (data, callback) => {
  const phone =
    typeof data.payload.phone === 'string' && data.payload.phone.length === 10
      ? data.payload.phone
      : false;
  const protocol =
    typeof data.payload.protocol === 'string' &&
    ['http', 'https'].includes(data.payload.protocol)
      ? data.payload.protocol
      : false;
  const url =
    typeof data.payload.url === 'string' && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  const method =
    typeof data.payload.phone === 'string' &&
    ['get', 'post', 'put', 'delete'].includes(data.payload.method.toLowerCase())
      ? data.payload.method.toLowerCase()
      : false;
  const successCodes =
    typeof data.payload.successCodes === 'object' &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  const timeoutSeconds =
    typeof data.payload.timeoutSeconds === 'number' &&
    data.payload.timeoutSeconds % 1 == 0 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  if (phone && protocol && url && method && successCodes && timeoutSeconds) {
    const token =
      typeof data.headers.token == 'string' ? data.headers.token : false;
    // Verify the submited token with user
    handlers._tokens.verifyToken(token, phone, (isTokenValid) => {
      if (isTokenValid) {
        _data.read('users', phone, (err, userData) => {
          if (!err) {
            const userChecks =
              typeof userData.checks == 'object' &&
              userData.checks instanceof Array
                ? userData.checks
                : [];
            // verify that the user has less than the max checks per user
            if (userChecks.length < config.maxChecks) {
              // create a random id for the check
              const checkId = helpers.createRandomString(20);
              const checkObject = {
                id: checkId,
                userPhone: phone,
                protocol,
                url,
                method,
                successCodes,
                timeoutSeconds,
              };
              _data.create('checks', checkId, checkObject, (err) => {
                if (!err) {
                  userData.checks = userChecks;
                  userData.checks.push(checkId);
                  _data.update('users', phone, userData, (err) => {
                    if (!err) {
                      callback(200, checkObject);
                    } else {
                      callback(500, {
                        error:
                          "could not update the user's data with new check",
                      });
                    }
                  });
                } else {
                  callback(500, { error: 'could not create the check' });
                }
              });
            } else {
              callback(400, {
                error:
                  'user already has maximum number of checks (' +
                  config.maxChecks +
                  ')',
              });
            }
          } else {
            callback(500, { error: 'could ont load users data' });
          }
        });
      } else {
        callback(403, { error: 'invalid token' });
      }
    });
  } else {
    callback(400, { error: 'missing required fields' });
  }
};
// checkc/PUT
// Required data: phone, check id
// Optional data: protocol, url, method, successCodes, timeoutSeconds
handlers._checks.put = (data, callback) => {
  const checkId =
    typeof data.payload.id == 'string' && data.payload.id.length == 20
      ? data.payload.id
      : false;
  const phone =
    typeof data.payload.phone === 'string' && data.payload.phone.length === 10
      ? data.payload.phone
      : false;
  const protocol =
    typeof data.payload.protocol === 'string' &&
    ['http', 'https'].includes(data.payload.protocol)
      ? data.payload.protocol
      : false;
  const url =
    typeof data.payload.url === 'string' && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  const method =
    typeof data.payload.phone === 'string' &&
    ['get', 'post', 'put', 'delete'].includes(data.payload.method.toLowerCase())
      ? data.payload.method.toLowerCase()
      : false;
  const successCodes =
    typeof data.payload.successCodes === 'object' &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  const timeoutSeconds =
    typeof data.payload.timeoutSeconds === 'number' &&
    data.payload.timeoutSeconds % 1 == 0 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  if (phone && checkId) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      const token =
        typeof data.headers.token == 'string' ? data.headers.token : false;
      // Verify the submited token with user
      handlers._tokens.verifyToken(token, phone, (isTokenValid) => {
        if (isTokenValid) {
          _data.read('checks', checkId, (err, checkData) => {
            if (!err) {
              if (checkData.userPhone == phone) {
                if (protocol) checkData.protocol = protocol;
                if (protocol) checkData.url = url;
                if (protocol) checkData.method = method;
                if (protocol) checkData.successCodes = successCodes;
                if (protocol) checkData.timeoutSeconds = timeoutSeconds;
                _data.update('checks', checkId, checkData, (err) => {
                  if (!err) {
                    callback(200, checkData);
                  } else {
                    callback(500, { error: 'could not update check data' });
                  }
                });
              } else {
                callback(500, { error: 'could not load check data' });
              }
            } else {
              callback(400, {
                error: 'check with the submited check id doesnt exist',
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
    callback(400, { error: 'missing required fields' });
  }
};
// checkc/DELETE
handlers._checks.delete = (data, callback) => {
  // check that the phone number is valid
  const checkId =
    typeof data.queryStringObject.id == 'string' &&
    data.queryStringObject.id.length == 20
      ? data.queryStringObject.id
      : false;
  const phone =
    typeof data.queryStringObject.phone == 'string' &&
    data.queryStringObject.phone.length == 10
      ? data.queryStringObject.phone
      : false;
  if (checkId && phone) {
    const token =
      typeof data.headers.token == 'string' ? data.headers.token : false;
    // Verify the submited token with phone
    handlers._tokens.verifyToken(token, phone, (isTokenValid) => {
      if (isTokenValid) {
        _data.read('checks', checkId, (err, checkData) => {
          if (!err && data) {
            if (checkData.userPhone == phone) {
              _data.read('users', phone, (err, userData) => {
                if (!err && userData) {
                  userData.checks = userData.checks.filter(
                    (check) => check != checkId
                  );
                  Array.filter;
                  _data.update('users', phone, userData, (err) => {
                    if (!err) {
                      _data.delete('checks', checkId, (err) => {
                        if (!err) {
                          callback(200);
                        } else {
                          callback(500, {
                            error: "could not delete user's check",
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: 'could not update the user removing the check',
                      });
                    }
                  });
                } else {
                  callback(400, { error: 'user of specified id doesnt exist' });
                }
              });
            } else {
              callback(403, { error: 'check does belong to user' });
            }
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
