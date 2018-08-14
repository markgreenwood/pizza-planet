const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');

const server = {};

server.httpServer = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  const queryString = parsedUrl.query;
  const method = req.method.toLowerCase();
  const headers = req.headers;

  let buffer = '';
  const decoder = new StringDecoder('utf8');

  // Body parser
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    const data = {
      trimmedPath,
      queryString,
      method,
      headers,
      payload: helpers.parseJsonToObject(buffer)
    };

    // Check route and call the handler
    const selectedHandler = trimmedPath ? server.router[trimmedPath] : handlers.notFound;

    selectedHandler(data, (statusCode, payload, contentType) => {
      contentType = contentType ? contentType : 'json';

      let payloadString = '';

      if (contentType == 'json') {
        res.setHeader('Content-Type', 'application/json');
        payloadString = JSON.stringify(payload);
      }

      if (contentType == 'text') {
        res.setHeader('Content-Type', 'text/plain');
        payloadString = payload;
      }

      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
});

server.router = {
  'healthcheck': handlers.healthcheck,
  'hello': handlers.hello,
  'users': handlers.users,
  'tokens': handlers.tokens
};

server.init = () => {
  server.httpServer.listen(config.httpPort, () => {
    console.log(`Listening on port ${config.httpPort}`);
  });
};

module.exports = server;
