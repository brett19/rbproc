var path = require('path');
var fs = require('fs');
var StrToHashKey = require('./strtohashkey');

function normalizePath(file) {
  file = path.normalize(file);
  file = file.replace(/\\/g, '/');
  return file.toLowerCase();
};
module.exports.normalizePath = normalizePath;

function hashPath(file) {
  return StrToHashKey(normalizePath(file));
};
module.exports.hashPath = hashPath;

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", done);

  var wr = fs.createWriteStream(target);
  wr.on("error", done);
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}
module.exports.copyFile = copyFile;
