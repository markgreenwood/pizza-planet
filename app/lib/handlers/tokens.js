const helpers = require('../helpers');
const _data = require('../data');

const _tokens = {};

const tokens = (data, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];

  if (acceptedMethods.indexOf(data.method) < 0) {
    callback(405);
  }

  _tokens[data.method](data, callback);
};

_tokens.post = (data, callback) => {
  // Create a token (a.k.a. login)
  // Validate data
  const phone = helpers.validatePhone(data.payload.phone);
  const hashedPassword = helpers.hash(data.payload.password);

  // Look up user
  _data.read('users', phone, (err, userData) => {
    if (err || !userData) {
      callback(400, 'User does not exist');
    }

    if (hashedPassword !== userData.hashedPassword) {
      callback(403);
    }

    // Generate a token for the user
    const tokenId = helpers.createRandomString(20);
    const expires = Date.now() + (1000 * 60 * 60); // expires in 1 hour
    const tokenObj = {
      phone,
      expires,
      id: tokenId
    };

    _data.create('tokens', tokenId, tokenObj, (err) => {
      if (err) {
        callback(500, { Error: 'Could not create token' });
      }
      callback(200, tokenObj);
    });
  });
};

_tokens.get = (data, callback) => {
  // Validate id
  const id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;
  if (!id) {
    callback(400, { Error: 'Missing required field' });
  }
  _data.read('tokens', id, (err, tokenObj) => {
    if (err || !tokenObj) {
      callback(404);
    }
    callback(200, tokenObj);
  });
};

_tokens.put = (data, callback) => {
  console.log('PUT /token');
  callback(200);
};

_tokens.delete = (data, callback) => {
  // Validate id
  const id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;
  if (!id) {
    callback(400, { Error: 'Missing required field' });
  }

  // TODO: Validate that the user is logged in and can delete this token
  _data.read('tokens', id, (err, tokenObj) => {
    if (err || !tokenObj) {
      callback(400, { Error: 'Could not find specified token' });
    }
    _data.delete('tokens', id, (err) => {
      if (err) {
        callback(500, { Error: 'Could not delete token' });
      }
      callback(200);
    });
  });
};

module.exports = tokens;
