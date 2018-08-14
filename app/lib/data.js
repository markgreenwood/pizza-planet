const fs = require('fs');
const path = require('path');

const helpers = require('./helpers');

// Base dir of data folder
const baseDir = path.join(__dirname, '/../.data/');

const data = {};

// Read data from a file
data.read = (dir, file, callback) => {
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
data.create = function(dir, file, data, callback) {
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

// Update data in an existing file
data.update = function(dir, file, data, callback) {
  // Open the file for writing
  fs.open(baseDir + dir + '/' + file + '.json', 'r+', function(err, fileDescriptor) {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);

      // Truncate the contents of the file before writing
      fs.truncate(fileDescriptor, function(err) {
        if (!err) {
          // Write to the file and close it
          fs.writeFile(fileDescriptor, stringData, function(err) {
            if (!err) {
              fs.close(fileDescriptor, function(err) {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing the file.')
                }
              })
            } else {
              callback('Error writing to existing file.');
            }
          })
        } else {
          callback('Error truncating file.');
        }
      })
    } else {
      callback('Could not open the file for updating. It may not exist yet.');
    }
  });
};

// Delete a file
data.delete = (dir, file, callback) => {
  // Unlink the file
  fs.unlink(baseDir + dir + '/' + file + '.json', (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting file.');
    }
  });
};

module.exports = data;
