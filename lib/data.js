//library for storing an dretriving data

const fs = require('fs');
const path = require('path');
const lib = {};
lib.baseDir = path.join(__dirname, '/../.data/');
//function to write data to a file
lib.create = (dir, file, data, callback) => {
  //open the file for writing
  fs.open(
    lib.baseDir + dir + '/' + file + '.json',
    'wx',
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // convert data to a string
        const stringData = JSON.stringify(data);
        // write t file and close it
        fs.writeFile(fileDescriptor, stringData, (err) => {
          if (!err) {
            fs.close(fileDescriptor, (err) => {
              if (!err) {
                callback(false);
              } else {
                callback('Error closing new file');
              }
            });
          } else {
            callback('Error writing to new file');
          }
        });
      } else {
        callback('could not create new file it may already exist');
      }
    }
  );
};
lib.read = (dir, file, callback) => {
  fs.readFile(
    lib.baseDir + dir + '/' + file + '.json',
    'utf-8',
    (err, data) => {
      if (!err && data) {
        callback(err, JSON.parse(data));
      } else {
        callback('error reading file it may not exist');
      }
    }
  );
};
lib.update = (dir, file, data, callback) => {
  //open the file for writing
  fs.open(
    lib.baseDir + dir + '/' + file + '.json',
    'r+',
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // convert data to a string
        const stringData = JSON.stringify(data);
        fs.ftruncate(fileDescriptor, (err) => {
          if (!err) {
            fs.writeFile(fileDescriptor, stringData, (err) => {
              if (!err) {
                fs.close(fileDescriptor, (err) => {
                  if (!err) {
                    callback(false);
                  } else {
                    callback('Error closing new file');
                  }
                });
              } else {
                callback('Error writing to new file');
              }
            });
          } else {
            callback('Error trancating file');
          }
        });
        // write t file and close it
      } else {
        callback('could not open file for updating, it may not exist yet');
      }
    }
  );
};
lib.delete = (dir, file, callback) => {
  fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('error removing file it may not exist');
    }
  });
};
lib.list = (dir, callback) => {
  fs.readdir(lib.baseDir + dir, (err, data) => {
    if (!err && data) {
      data = data.map((file) => file.replace('.json', ''));
      callback(false, data);
    } else {
      callback(err);
    }
  });
};
module.exports = lib;
