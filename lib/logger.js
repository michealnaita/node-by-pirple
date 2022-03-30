const lib = {};

//DDEPENDENCIES
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");
const util = require("util");

const debugLogs = util.debuglog("logs");

lib.baseDir = path.join(__dirname, "/../", ".logs");

// TODO: this function zip files
// Compress old log files and store then in the archive
lib.rotateLogs = (dir) => {
  const pathToLogs = path.join(lib.baseDir, dir);

  // get all logs in submited directory
  fs.readdir(pathToLogs, (err, logs) => {
    logs.forEach((log) => {
      const uncompressedFilePath = path.join(pathToLogs, log);
      // read in file contents
      fs.readFile(uncompressedFilePath, "utf-8", (err, data) => {
        if (!err) {
          zlib.gzip(data, (err, buffer) => {
            if (!err) {
              const archivedFile = log.replace(
                ".log",
                " [archived: " + Date.now().toString() + "].gz.bs64"
              );
              const compressedFiledPath = path.join(pathToLogs, archivedFile);
              fs.open(compressedFiledPath, "wx", (err, fileDescriptor) => {
                if (!err) {
                  fs.writeFile(
                    fileDescriptor,
                    buffer.toString("base64"),
                    (err) => {
                      if (!err) {
                        fs.unlink(uncompressedFilePath, (err) => {
                          if (err)
                            console.error(
                              "could not delete log file [" + log + "]"
                            );
                        });
                      } else {
                        console.error(
                          "could not write to compressed log file [" +
                            archivedFile +
                            "]"
                        );
                      }
                    }
                  );
                } else {
                  console.error(
                    "could not open compressed log file [" + archivedFile + "]"
                  );
                }
                fs.close(fileDescriptor);
              });
            } else {
              console.error("could not compress file [" + log + "]");
            }
          });
        } else {
          console.error("could not read log files contents [" + log + "]");
        }
      });
    });
  });
};

//  TODO: this function upzip files

// Append a log to a log file in a specified dir
lib.writeLog = (dir, file, logData) => {
  logData = logData + "\n";
  file = file + ".log";

  const filePath = path.join(lib.baseDir, dir, file);
  debugLogs;

  fs.open(filePath, "a", (err, fileDescriptor) => {
    if (!err) {
      fs.appendFile(fileDescriptor, logData, (err) => {
        if (!err) {
          debugLogs("logged to file [" + file + "]");
        } else {
          debugLogs("could not append log to file [" + file + "]");
        }
        fs.close(fileDescriptor);
      });
    } else {
      console.error("could not open log file [" + file + "]\n MORE> " + err);
    }
  });
};

// retrive specific log
lib.read = (dir, file, callback) => {
  fs.readFile(
    lib.baseDir + "/" + dir + "/" + file + ".log",
    "utf-8",
    (err, data) => {
      if (!err && data) {
        callback(err, data);
      } else {
        callback("error reading file it may not exist");
      }
    }
  );
};

// retrive all logs under a specific category
lib.list = (dir, callback) => {
  fs.readdir(lib.baseDir + "/" + dir, (err, files) => {
    if (!err && files) {
      const data = [];
      if (files.length) {
        files.forEach((file, i) => {
          file = file.replace(".log", "");
          lib.read(dir, file, (err, fileData) => {
            if (!err && fileData) {
              data.push(fileData);
              if (i == files.length - 1) callback(false, data);
            } else {
              callback(err);
            }
          });
        });
      } else {
        callback("there aren't any logs on " + dir);
      }
    } else {
      console.log("error: ", err);
      callback("error getting all data");
    }
  });
};
module.exports = lib;
