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
  return typeof(str) == 'string' && str.trim().length == 10 && str.trim().match(/^[0-9]+$/) ? str.trim() : false;
};

const validateEmail = (str) => {
  return typeof(str) == 'string' && str.trim().length > 3 && str.trim().match(/^[A-Za-z0-9_.]+@[A-Za-z0-9_]+\.[A-Za-z0-9_]+$/) ? str.trim() : false;
};

const validatePassword = (str) => {
  return typeof(str) == 'string' && str.length > 8 ? str : false;
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
  validatePassword,
  hash
};
