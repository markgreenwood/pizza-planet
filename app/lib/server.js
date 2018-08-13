const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const handlers = require('./handlers');

const server = {};

server.httpServer = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  const queryStringObject = parsedUrl.query;
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
      queryStringObject,
      method,
      headers
    };

    console.log('trimmedPath ', trimmedPath)

    // Check route and call the handler
    const selectedHandler = trimmedPath ? server.router[trimmedPath] : handlers.notFound;

    selectedHandler(data, (statusCode, payload, contentType) => {
      contentType = contentType ? contentType : 'text/plain';
      res.setHeader('Content-Type', contentType);
      res.writeHead(statusCode);
      res.end(payload);
    });
  });
});

server.router = {
  'healthcheck': handlers.healthcheck,
  'hello': handlers.hello,
  'users': handlers.users
};

server.init = () => {
  server.httpServer.listen(config.httpPort, () => {
    console.log(`Listening on port ${config.httpPort}`);
  });
};

module.exports = server;
