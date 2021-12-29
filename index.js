/**
 * Primary file  for the API
 */

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const _data = require('./lib/data');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// server prototype
const unifiedServer = (req, res) => {
  // get url and parse it
  const parsedUrl = url.parse(req.url, true);

  // get path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const method = req.method.toLowerCase();

  // Get the quesry string as an Object
  const queryStringObject = parsedUrl.query;

  // Get http Headers
  const headers = req.headers;

  //get payload

  const decorder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => (buffer += decorder.write(data)));
  req.on('end', () => {
    buffer += decorder.end();
    // choose the handler w this request shoiuld go  to
    const choosenHandler = router[trimmedPath] || handlers.notFound;
    const data = {
      payload: helpers.parseJsonToObject(buffer),
      trimmedPath,
      queryStringObject,
      method,
      headers,
    };
    choosenHandler(data, (statusCode = 200, payload = {}) => {
      const payloadString = JSON.stringify(payload);
      res.setHeader('content-type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      // log the request path
      console.log('returning response: ', statusCode, payloadString);
    });
  });
};
const httpServer = http.createServer((req, res) => unifiedServer(req, res));
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
};

const httpsServer = http.createServer(httpsServerOptions, (req, res) =>
  unifiedServer(req, res)
);

// initialise HTTP server
httpServer.listen(config.httpPort, () => {
  console.log(`server is listening on port ${config.httpPort}`);
});

// initialise HTTPs server
httpsServer.listen(config.httpsPort, () => {
  console.log(`server is listening on port ${config.httpsPort}`);
});

// router
const router = {
  ping: handlers.ping,
  checks: handlers.checks,
  users: handlers.users,
  tokens: handlers.tokens,
};
