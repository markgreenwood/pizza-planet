const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');

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

server.httpServer.listen(3000, () => {
  console.log('Listening on port 3000');
});

const handlers = {};

handlers.healthcheck = (data, callback) => {
  callback(200, 'Pizza Planet site is healthy');
};

handlers.hello = (data, callback) => {
  callback(200, 'Hello from Pizza Planet!');
}

handlers.notFound = (data, callback) => {
  callback(404);
};

server.router = {
  'healthcheck': handlers.healthcheck,
  'hello': handlers.hello
};
