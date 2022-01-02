/**
 * These are the CHECKS SERVICE request handlers
 */
// Dependencies
const _data = require('../data');
const helpers = require('../helpers.js');
const handlers = {};
const config = require('../config');

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
