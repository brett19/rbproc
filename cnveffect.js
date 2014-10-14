var util = require('util');
var CnvProc = require('./cnvproc');

function CnvEffect(options) {
  CnvProc.call(this, options, options.path);

  this.path = options.path;
  this.eftPath = 'effect/' + this.name;
}
util.inherits(CnvEffect, CnvProc);

CnvEffect.prototype.getPaths = function() {
  return [this.eftPath];
};

CnvEffect.prototype.process = function(callback) {
  console.log('Processing Effect', this.path);

  callback(null, false);
};

module.exports = CnvEffect;
