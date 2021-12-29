// create configuration variables
const environments = {};

environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'this is a secret',
  maxChecks: 5,
};

environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'this is a secret',
  maxChecks: 5,
};
const currentEnv = process.env.NODE_ENV
  ? environments[process.env.NODE_ENV.toLowerCase()]
    ? environments[process.env.NODE_ENV.toLowerCase()]
    : environments['staging']
  : environments['staging'];
module.exports = currentEnv;
