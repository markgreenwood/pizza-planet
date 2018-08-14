const helpers = require('../helpers');
const _data = require('../data');

const _tokens = {};

const tokens = (data, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];

  if (acceptedMethods.indexOf(data.method) > -1) {
    _tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

_tokens.post = (data, callback) => {
  // Create a token (a.k.a. login)
  // Validate data
  const phone = helpers.validatePhone(data.payload.phone);
  const hashedPassword = helpers.hash(data.payload.password);

  // Look up user
  _data.read('users', phone, (err, userData) => {
    if (!err && userData) {
      if (hashedPassword == userData.hashedPassword) {
        // Generate a token for the user
        const tokenId = helpers.createRandomString(20);
        const expires = Date.now() + (1000 * 60 * 60); // expires in 1 hour
        const tokenObj = {
          phone,
          expires,
          id: tokenId
        };

        _data.create('tokens', tokenId, tokenObj, (err) => {
          if (!err) {
            callback(200, tokenObj);
          } else {
            callback(500, { Error: 'Could not create token' });
          }
        });
      } else {
        callback(403);
      }
    } else {
      callback(400, 'User does not exist');
    }
  });
};

_tokens.get = (data, callback) => {
  // Validate id
  const id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;
  if (id) {
    _data.read('tokens', id, (err, tokenObj) => {
      if (!err && tokenObj) {
        callback(200, tokenObj);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Extend the token - if it has not already expired and extend: true, extend the expiration
_tokens.put = (data, callback) => {
  const id = (typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20) ? data.payload.id.trim() : false;
  const extend = (typeof(data.payload.extend) == 'boolean' && data.payload.extend == true) ? true : false;

  console.log('Checking if id && extend...');
  if (id && extend) {
    _data.read('tokens', id, (err, tokenObj) => {
      console.log('Checking if err or missing tokenObj');
      if (!err && tokenObj) {
        console.log('Checking if token already expired, expiration is ', new Date(tokenObj.expires));
        if (tokenObj.expires > Date.now()) {
          console.log('Setting new expiration');
          tokenObj.expires = Date.now() + (1000 * 60 * 60); // Token will expire in another hour
          _data.update('tokens', id, tokenObj, (err) => {
            console.log('Checking if error extending token...');
            if (!err) {
              callback(200);
            } else {
              callback(500, { Error: 'Could not extend token' });
            }
          });
        } else {
          callback(400, { Error: 'Token already expired and cannot be extended' });
        }
      } else {
        callback(400, { Error: 'Specified token does not exist' });
      }
    });
  } else {
    callback(400, { Error: 'Missing or invalid required fields' });
  }
};

_tokens.delete = (data, callback) => {
  // Validate id
  const id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;
  if (id) {
    // TODO: Validate that the user is logged in and can delete this token
    _data.read('tokens', id, (err, tokenObj) => {
      if (!err && tokenObj) {
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: 'Could not delete token' });
          }
        });
      } else {
        callback(400, { Error: 'Could not find specified token' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

module.exports = tokens;
