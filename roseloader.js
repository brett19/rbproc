var BinaryReader = require('./binaryreader');
var fs = require('fs');

function RoseLoader() {}
RoseLoader.basePath = 'D:/zz_test_nevo/';

RoseLoader.load = function(path, callback) {
  BinaryReader.load(RoseLoader.basePath + path, callback);
};

RoseLoader.exists = function(path, callback) {
  fs.exists(RoseLoader.basePath + path, callback);
};

module.exports = RoseLoader;