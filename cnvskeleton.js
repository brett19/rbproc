var util = require('util');
var rutil = require('./rutil');
var CnvProc = require('./cnvproc');
var CnvManager = require('./cnvmanager');
var RoseLoader = require('./roseloader');

function CnvSkeleton(options) {
  CnvProc.call(this, options, options.path);

  this.path = options.path;
  this.skelPath = 'skeleton/' + this.name;
}
util.inherits(CnvSkeleton, CnvProc);

CnvSkeleton.prototype.getPaths = function() {
  return [this.skelPath];
};

CnvSkeleton.prototype.process = function(callback) {
  console.log('Processing Skeleton', this.path);

  rutil.copyFile(RoseLoader.basePath + this.path, CnvManager.genCachePath(this.skelPath), function() {
    callback(null, true);
  });
};

module.exports = CnvSkeleton;
