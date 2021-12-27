// create configuration variables
const environments = {};

environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
};

environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
};
const currentEnv = process.env.NODE_ENV
  ? environments[process.env.NODE_ENV.toLowerCase()]
    ? environments[process.env.NODE_ENV.toLowerCase()]
    : environments['staging']
  : environments['staging'];
module.exports = currentEnv;
