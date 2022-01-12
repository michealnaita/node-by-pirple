/**
 * This is the HTML templating engine
 */

// DEPENDENCIES
const fs = require('fs');
const path = require('path');

const engine = {};
engine.baseDir = path.join(__dirname, '/../');
engine._insertVariables = (str, pageVariables, callback) => {
  for (const key in pageVariables) {
    if (typeof pageVariables[key] == 'string') {
      const find = new RegExp('{' + key + '}', 'g');
      const replace = pageVariables[key];
      str = str.replace(find, replace);
    } else {
      throw new Error('Value should of type string ');
    }
  }
  callback(str);
};
engine._fetchDependencies = (originalFileContents, callback) => {
  const matchedDependencies = originalFileContents.match(
    /<!--\s@use\s([a-zA-Z]+)\s-->/g
  );
  matchedDependencies.forEach((str, index) => {
    const filename = str.replace(/(<!--\s@use\s)|(\s-->)/g, '');
    engine._getTemplate('_' + filename, (err, fileContents) => {
      if (!err && fileContents) {
        const find = new RegExp(str, 'g');
        const replace = fileContents;
        originalFileContents = originalFileContents.replace(find, replace);
        if (index == matchedDependencies.length - 1) {
          callback(false, originalFileContents);
        }
      } else {
        callback(err);
      }
    });
  });
  return originalFileContents;
};
engine._requiresDependencies = (fileContents) => {
  if (fileContents.match(/(<!--\s@use\s[a-zA-Z]+\s-->)/g)) return true;
  return false;
};
engine._getTemplate = (filename, callback) => {
  filename =
    // validate the filename is a string
    typeof filename == 'string' && filename.length > 0
      ? // check whether the file has an extension
        filename.match(/\w+\.[a-zA-Z]+/)
        ? filename
        : //default to a .html file
          filename + '.html'
      : false;
  if (filename) {
    const filePath = path.join(engine.baseDir, 'templates', filename);

    fs.readFile(filePath, 'utf8', (err, fileContents) => {
      if (!err && fileContents) {
        // check whether the file depends onn other files
        if (engine._requiresDependencies(fileContents)) {
          // load in dependency files
          engine._fetchDependencies(fileContents, (err, file) => {
            if (!err && file) {
              callback(false, file);
            } else {
              callback(err);
            }
          });
        } else {
          callback(false, fileContents);
        }
      } else {
        callback(err);
        console.log('could not read from file [' + filename + ']\n', err);
      }
    });
  } else {
    callback(new Error('invalid file name'));
  }
};

engine._getStatic = (filename, callback) => {
  filename =
    // validate the filename is a string
    typeof filename == 'string' && filename.length > 0 ? filename : false;

  if (filename) {
    const filePath = path.join(engine.baseDir, 'public', filename);

    fs.readFile(filePath, (err, buffer) => {
      if (!err && buffer) {
        callback(false, buffer);
      } else {
        callback(err);
        console.log('could not read from file [' + filename + ']\n', err);
      }
    });
  } else {
    callback(new Error('invalid file name'));
  }
};

/**
 * get file
 * look through file to see wether  the file requiures another file
 * get that other file adn replace it in the file
 * return one file
 */

/*
 *TODO: add a try catch to catch all errora thrown and callback with error true
 */
engine.render = (page, pageVariables, callback) => {
  if (typeof pageVariables == 'function' && typeof callback == 'undefined') {
    callback = pageVariables;
    engine._getTemplate(page, (err, file) => {
      if (!err && file) {
        callback(false, file);
      } else {
        callback(err);
        console.log(err);
      }
    });
  } else {
    engine._getTemplate(page, (err, file) => {
      if (!err && file) {
        engine._insertVariables(file, pageVariables, (file) =>
          callback(false, file)
        );
      } else {
        callback(err);
        console.log(err);
      }
    });
  }
};
module.exports = engine;
