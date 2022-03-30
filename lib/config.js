// create configuration variables
const environments = {};

environments.development = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "development",
  hashingSecret: "this is a secret",
  maxChecks: 5,
  twilio: {
    accountSid: "AC0e1b1679a8a08ffa301aaf10f4c89fd6",
    authToken: "3c179f549fad736067b90d67839577f7",
    fromPhone: "+15005550006",
  },
};
environments.testing = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "testing",
  hashingSecret: "this is a secret",
  maxChecks: 5,
  twilio: {
    accountSid: "AC0e1b1679a8a08ffa301aaf10f4c89fd6",
    authToken: "3c179f549fad736067b90d67839577f7",
    fromPhone: "+15005550006",
  },
};
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  hashingSecret: "this is a secret",
  maxChecks: 5,
  twilio: {
    accountSid: "AC0e1b1679a8a08ffa301aaf10f4c89fd6",
    authToken: "3c179f549fad736067b90d67839577f7",
    fromPhone: "+15005550006",
  },
};
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "this is a secret",
  maxChecks: 5,
  twilio: {
    accountSid: "ACb32d411ad7fe886aac54c665d25e5c5d",
    authToken: "9455e3eb3109edc12e3d8c92768f7a67",
    fromPhone: "+15005550006",
  },
};
const currentEnv = process.env.NODE_ENV
  ? environments[process.env.NODE_ENV.toLowerCase()]
    ? environments[process.env.NODE_ENV.toLowerCase()]
    : environments["development"]
  : environments["development"];
module.exports = currentEnv;
