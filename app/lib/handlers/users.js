const helpers = require('../helpers');
const _data = require('../data');

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
  console.log('Attempting POST /users', data.payload);

  // Validate the parameters passed in: name, email, address, password
  const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.length > 0 ? data.payload.firstName : false;
  const phone = helpers.validatePhone(data.payload.phone) ? data.payload.phone : false;
  const email = helpers.validateEmail(data.payload.email) ? data.payload.email : false;
  const address = typeof(data.payload.address) == 'string' && data.payload.address.length > 0 ? data.payload.address : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password && data.payload.password.length > 8 ? data.payload.password : false;

  if (firstName && phone && email && address && password) {

    // Check for pre-existing user
    _data.read('users', phone, (err, data) => {
      if (err) {
        // TODO: Hash the password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // TODO: Save the new user
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
              callback(500, { Error: 'Could not create the new user.' }, 'application/json');
            }
          });
        } else {
          callback(500, { Error: 'Failed to hash user\'s password' }, 'application/json');
        }
      } else {
        callback(400, { Error: 'User already exists' }, 'application/json');
      }
    });
  } else {
    callback(400, { Error: 'Missing or invalid required parameters' }, 'application/json');
  }
};

_users.put = (data, callback) => {
  console.log('PUT /users', data.payload);
  callback(200);
};

_users.delete = (data, callback) => {
  console.log('DELETE /users', data.payload);
  callback(200);
};

module.exports = users;
