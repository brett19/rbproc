var rutil = require('./rutil');

function CnvProc(options, hashPath) {
  this.hash = rutil.hashPath(hashPath);
  this.name = (options && options.name) ? options.name : this.hash.toString(16);
  this.processed = false;
}

module.exports = CnvProc;
