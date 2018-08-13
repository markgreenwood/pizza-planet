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

handlers.users = {

};

module.exports = handlers;
