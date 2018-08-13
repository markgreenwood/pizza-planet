const users = require('./users');

const healthcheck = (data, callback) => {
  callback(200, 'Pizza Planet site is up and running', 'text/plain');
};

const hello = (data, callback) => {
  callback(200, 'Hello from Pizza Planet!', 'text/plain');
};

const notFound = (data, callback) => {
  callback(404);
};

module.exports = {
  healthcheck,
  hello,
  notFound,
  users
};
