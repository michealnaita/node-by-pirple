// create configuration variables
const environments = {};

environments.development = {
  httpPort: process.env.HTTP_PORT || 3000,
  httpsPort: process.env.HTTPS_PORT || 3001,
  envName: 'development',
  hashingSecret: 'this is a secret',
  maxChecks: 5,
  twilio: {
    accountSid: process.env.ACCOUNT_SID,
    authToken: process.env.AUTH_TOKEN,
    fromPhone: '+15005550006',
  },
};
environments.testing = {
  httpPort: process.env.HTTP_PORT || 3000,
  httpsPort: process.env.HTTPS_PORT || 3001,
  envName: 'testing',
  hashingSecret: 'this is a secret',
  maxChecks: 5,
  twilio: {
    accountSid: process.env.ACCOUNT_SID,
    authToken: process.env.AUTH_TOKEN,
    fromPhone: '+15005550006',
  },
};
environments.staging = {
  httpPort: process.env.HTTP_PORT || 3000,
  httpsPort: process.env.HTTPS_PORT || 3001,
  envName: 'staging',
  hashingSecret: 'this is a secret',
  maxChecks: 5,
  twilio: {
    accountSid: process.env.ACCOUNT_SID,
    authToken: process.env.AUTH_TOKEN,
    fromPhone: '+15005550006',
  },
};
environments.production = {
  httpPort: process.env.HTTP_PORT || 5000,
  httpsPort: process.env.HTTPS_PORT || 5001,
  envName: 'production',
  hashingSecret: 'this is a secret',
  maxChecks: 5,
  twilio: {
    accountSid: process.env.ACCOUNT_SID,
    authToken: process.env.AUTH_TOKEN,
    fromPhone: '+15005550006',
  },
};
const currentEnv = process.env.NODE_ENV
  ? environments[process.env.NODE_ENV.toLowerCase()]
    ? environments[process.env.NODE_ENV.toLowerCase()]
    : environments['development']
  : environments['development'];
module.exports = currentEnv;
