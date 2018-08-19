const _menuitems = {};

const menuitems = (data, callback) => {
  const acceptedMethods = ['post', 'put', 'get', 'delete'];

  if (acceptedMethods.indexOf(data.method) > -1) {
    _menuitems[data.method](data, callback);
  } else {
    callback(405);
  }
};

_menuitems.get = (data, callback) => {
  callback(200, ['pepperoni', 'sausage', 'anchovies']);
};

module.exports = menuitems;
