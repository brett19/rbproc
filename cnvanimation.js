var util = require('util');
var rutil = require('./rutil');
var CnvProc = require('./cnvproc');
var CnvManager = require('./cnvmanager');
var RoseLoader = require('./roseloader');

function CnvAnimation(options) {
  CnvProc.call(this, options, options.path);

  this.path = options.path;
  this.anmPath = 'animation/' + this.name;
}
util.inherits(CnvAnimation, CnvProc);

CnvAnimation.prototype.getPaths = function() {
  return [this.anmPath];
};

CnvAnimation.prototype.process = function(callback) {
  console.log('Processing Animation', this.path);

  rutil.copyFile(RoseLoader.basePath + this.path, CnvManager.genCachePath(this.anmPath), function() {
    callback(null, true);
  });
};

module.exports = CnvAnimation;
