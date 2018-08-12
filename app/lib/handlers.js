const handlers = {};

handlers.healthcheck = (data, callback) => {
  callback(200, 'Pizza Planet site is up and running');
};

handlers.hello = (data, callback) => {
  callback(200, 'Hello from Pizza Planet!');
}

handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
