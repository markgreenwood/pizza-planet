const crypto = require('crypto');
const config = require('./config');

const parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (err) {
    return {};
  }
};

const validatePhone = (str) => {
  return typeof(str) == 'string' && str.length == 10 && str.match(/^[0-9]+$/);
};

const validateEmail = (str) => {
  return typeof(str) == 'string' && str.length > 3 && str.match(/^[A-Za-z0-9_.]+@[A-Za-z0-9_]+\.[A-Za-z0-9_]+$/);
};

const hash = (str) => {
  if (typeof(str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

module.exports = {
  parseJsonToObject,
  validatePhone,
  validateEmail,
  hash
};
