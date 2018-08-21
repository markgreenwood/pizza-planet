const menu = {
  'size': [
    'personal',
    'medium',
    'large'
  ],
  'crust': [
    'thick',
    'thin'
  ],
  'sauce': [
    'bianco',
    'traditional'
  ],
  'toppings': [
    'pepperoni',
    'sausage',
    'mushrooms',
    'anchovies',
    'peppers',
    'artichokes'
  ]
};

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
  callback(200, menu);
};

module.exports = menuitems;
