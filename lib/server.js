/**
 * Primary file  for the initating  the server
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
//  ROUTES
const router = {
  '': handlers.index,
  'account/create': handlers.createAccount,
  'account/edit': handlers.editAccount,
  'account/deleted': handlers.deletedAccount,
  'session/create': handlers.createSession,
  'session/deleted': handlers.deletedSession,
  checks: handlers.checksList,
  'checks/create': handlers.createCheck,
  'checks/edit': handlers.editCheck,
  ping: handlers.ping,
  'api/checks': handlers.checks,
  'api/users': handlers.users,
  'api/tokens': handlers.tokens,
  'favicon.ico': handlers.favicon,
  public: handlers.public,
};

class Server {
  constructor(protocol, port) {
    protocol =
      typeof protocol == 'string' && ['http', 'https'].includes(protocol)
        ? protocol
        : false;
    port = typeof port == 'number' && port > 0 ? port : false;
    if (protocol && port) {
      if (protocol == 'http') {
        this.protocol = http;
      }
      if (protocol == 'https') {
        this.protocol = https;
        this.httpsOptions = {
          key: fs.readFileSync(path.join(__dirname, '/../', 'https/key.pem')),
          cert: fs.readFileSync(path.join(__dirname, '/../', 'https/cert.pem')),
        };
      }
      this.port = port;
    } else {
      throw new Error('Protocol Not Supported or Invalid port ');
    }
  }
  modal(req, res) {
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
      let choosenHandler;
      if (trimmedPath.match(/public\/\w+/)) {
        choosenHandler = router['public'];
      } else {
        choosenHandler = router[trimmedPath] || handlers.notFound;
      }

      const data = {
        payload: helpers.parseJsonToObject(buffer),
        trimmedPath,
        queryStringObject,
        method,
        headers,
      };

      choosenHandler(
        data,
        (statusCode = 200, payload, contentType = 'application/json') => {
          let payloadString;

          if (contentType == 'application/json') {
            payload = typeof payload == 'object' ? payload : {};
            payloadString = JSON.stringify(payload);
            res.setHeader('content-type', 'application/json');
          } else {
            payloadString = typeof payload !== 'undefined' ? payload : '';
            res.setHeader('content-type', contentType);
          }

          res.writeHead(statusCode);
          res.end(payloadString);

          // log the request path
          console.log(
            method.toUpperCase() + '/' + trimmedPath + ': ',
            statusCode
          );
        }
      );
    });
  }
  start() {
    let serverInstannce;
    if (this.httpsOptions) {
      serverInstannce = this.protocol.createServer(
        this.httpsOptions,
        (req, res) => this.modal(req, res)
      );
    } else {
      serverInstannce = this.protocol.createServer((req, res) =>
        this.modal(req, res)
      );
    }
    serverInstannce.listen(this.port, () => {
      console.log('server running on port:' + this.port);
    });
  }
}

const serverBanch = {};
// start server instances
serverBanch.init = () => {
  const httpServer = new Server('http', 3000);
  const httpsServer = new Server('https', 3001);
  httpServer.start();
  httpsServer.start();
};

module.exports = serverBanch;
