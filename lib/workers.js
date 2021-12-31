// DEPENDENCIES
const https = require('https');
const http = require('http');
const _data = require('./data');
const _logger = require('./logger');
const helpers = require('./helpers');

const supportedPrococols = {
  http,
  https,
};
const worker = {};
worker.reportError = (err) => {
  // report at an issue to admin
  console.log('Workers Error: ', err);
  _logger.writeLog('errors', 'CHECK_WORKERS', err);
};

worker.alertUser = (phone, msg) => {
  // TODO: MAK ETHE PHONE DYNAMYICC FOR EVERY USER
  helpers.sendTwillioSms('4154568376', msg, (err) => {
    if (!err) {
      console.log('user (' + phone + ') has been alerted');
    } else {
      worker.reportError(
        'could not send status change message to user (' + phone + ')'
      );
    }
  });
};

worker.getAllChecks = (callback) => {
  _data.list('checks', (err, checks) => {
    if (!err && checks) {
      if (checks.length > 0) {
        // load all data related to the checks
        checks.length &&
          checks.forEach((check) => {
            _data.read('checks', check, (err, checkData) => {
              if (!err && checkData) {
                callback(checkData);
              } else {
                worker.reportError(
                  'could not load checks data ( checkId: ' + check + ')'
                );
              }
            });
          });
      } else {
        worker.reportError('No checks to run');
      }
    } else {
      worker.reportError('could not fetch all checks');
    }
  });
};
worker.runCheck = (originalCheckData) => {
  const requestOutcome = {
    statusCode: false,
    error: false,
  };

  const protocol = supportedPrococols[originalCheckData.protocol];

  const url = new URL(
    originalCheckData.protocol + '://' + originalCheckData.url
  );
  const requestDetails = {
    protocol: originalCheckData.protocol + ':',
    hostname: url.host,
    path: url.pathname + url.search,
    method: originalCheckData.method.toUpperCase(),
    timeout: originalCheckData.timeoutSeconds * 1000,
  };
  let hasSentRequest = false;
  const req = protocol.request(requestDetails, (res) => {
    if (!hasSentRequest) {
      requestOutcome.statusCode = res.statusCode;
      worker.proccessCheck(originalCheckData, requestOutcome);
      hasSentRequest = true;
    }
  });
  req.on('error', (err) => {
    worker.reportError(
      'Error running check (' + originalCheckData.id + '): ' + err.message
    );
  });
  req.on('timeout', (err) => {
    if (!hasSentRequest) {
      requestOutcome.error = {
        error: true,
        value: 'timeout',
      };
      worker.proccessCheck(originalCheckData, requestOutcome);
      hasSentRequest = true;
    }
  });
  req.end();
};
worker.proccessCheck = (originalCheckData, requestOutcome) => {
  const onRequestTime = Date.now();
  // assert that the response status code matches atleast one of the check success codes
  let status = originalCheckData.successCodes.includes(
    requestOutcome.statusCode
  )
    ? 'up'
    : 'down';
  const updatedCheckData = originalCheckData;
  updatedCheckData.lastChecked = onRequestTime;

  // determine whether to alert the user on status change
  if (originalCheckData.status != status) {
    updatedCheckData.status = status;
    worker.alertUser(
      originalCheckData.userPhone,
      'Your website is now ' + updatedCheckData.status
    );
  } else {
    updatedCheckData.status = status;
  }

  _data.update('checks', originalCheckData.id, updatedCheckData, (err) => {
    if (err)
      worker.reportError(
        'could not update check (' +
          originalCheckData.id +
          ') with values form the check request outcome'
      );
  });
  const logMessage = {
    checkId: originalCheckData.id,
    proccessed: true,
    status: status,
    proccessedAt: onRequestTime,
  };

  console.log(
    'check [' +
      originalCheckData.id +
      '] has been proccessed [' +
      onRequestTime +
      ']'
  );
  _logger.writeLog('checks', originalCheckData.id, JSON.stringify(logMessage));
};
worker.loop = (chore, interval) => {
  setInterval(() => {
    chore();
  }, 1000 * (interval || 60));
};
worker.init = () => {
  // wrapper function to run checks
  const checksChore = () =>
    worker.getAllChecks((check) => {
      worker.runCheck(check);
    });

  // run all checks every 60 seconds
  checksChore();
  worker.loop(checksChore);

  // compress and archive old check logs evry 24 hours
  worker.loop(() => _logger.rotateLogs('checks'), 60 * 60 * 24);
};

module.exports = worker;
