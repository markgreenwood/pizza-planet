const fs = require('fs');
const path = require('path');

const helpers = require('./helpers');

// Base dir of data folder
const baseDir = path.join(__dirname, '/../.data/');

// Read data from a file
const read = (dir, file, callback) => {
  fs.readFile(baseDir + dir + '/' + file + '.json', 'utf-8', function(err, data) {
    if (!err && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

// Write data to a file
const create = function(dir, file, data, callback) {
  // Try opening the file for writing
  fs.open(baseDir + dir + '/' + file + '.json', 'wx', function(err, fileDescriptor) {
    if (!err && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData, function(err) {
        if (!err) {
          fs.close(fileDescriptor, function(err) {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing new file.');
            }
          })
        } else {
          callback('Error writing to new file');
        }
      })
    } else {
      callback('Could not create new file, it may already exist.');
    }
  });
};

module.exports = {
  read,
  create
};
