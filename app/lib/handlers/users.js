const helpers = require('../helpers');
const _data = require('../data');
const { verifyToken } = require('../auth');

const _users = {};

// Top level users handler
const users = (data, callback) => {
  const acceptedMethods = ['post', 'put', 'delete'];

  if (acceptedMethods.indexOf(data.method) > -1) {
    _users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Create a new user
_users.post = (data, callback) => {
  // Validate the parameters passed in: name, email, address, password
  const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const phone = helpers.validatePhone(data.payload.phone);
  const email = helpers.validateEmail(data.payload.email);
  const address = typeof(data.payload.address) == 'string' && data.payload.address.length > 0 ? data.payload.address : false;
  const password = helpers.validatePassword(data.payload.password);

  if (firstName && phone && email && address && password) {

    // Check for pre-existing user
    _data.read('users', phone, (err, data) => {
      if (err) {
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          const userObject = {
            firstName,
            phone,
            email,
            address,
            hashedPassword
          };

          // Store the user
          _data.create('users', phone, userObject, function(err) {
            if (!err) {
              callback(200, userObject, 'application/json');
            } else {
              console.log(err);
              callback(500, { Error: 'Could not create the new user.' });
            }
          });
        } else {
          callback(500, { Error: 'Failed to hash user\'s password' });
        }
      } else {
        callback(400, { Error: 'User already exists' });
      }
    });
  } else {
    callback(400, { Error: 'Missing or invalid required parameters' });
  }
};

_users.put = (data, callback) => {
  // Check required fields
  const phone = helpers.validatePhone(data.payload.phone);

  // Check optional fields
  const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.length > 0 ? data.payload.firstName : false;
  const email = helpers.validateEmail(data.payload.email);
  const address = typeof(data.payload.address) == 'string' && data.payload.address.length > 0 ? data.payload.address : false;
  const password = helpers.validatePassword(data.payload.password);

  if (phone) {
    if (firstName || email || address || password) {
      // Look up the user
      // TODO: Make sure user is authorized before modifying data
      // Read user's existing data
      _data.read('users', phone, (err, userData) => {
        if (!err && userData) {
          if (firstName) {
            userData.firstName = firstName;
          }

          if (email) {
            userData.email = email;
          }

          if (address) {
            userData.address = address;
          }

          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }

          _data.update('users', phone, userData, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(500, { Error: 'Failed to update user' });
            }
          })
        } else {
          callback(400, { Error: 'Specified user does not exist' });
        }
      });
    } else {
      callback(400, { Error: 'Missing fields to update' });
    }
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

_users.delete = (data, callback) => {
  // Check required fields
  const phone = helpers.validatePhone(data.queryString.phone);

  if (phone) {
    // Look up the user
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // TODO: authorize deletion by checking token
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        verifyToken(token, phone, (tokenValid) => {
          if (tokenValid) {
            _data.delete('users', phone, (err) => {
              if (!err) {
                callback(200);
              } else {
                callback(500, { Error: 'Failed to delete user' });
              }
            });
          } else {
            callback(400, { Error: 'Missing or invalid token' });
          }
        });
      } else {
        callback(400, { Error: 'Specified user does not exist' });
      }
    });
  } else {
    console.log(400, { Error: 'Missing required fields' });
  }
};

module.exports = users;
