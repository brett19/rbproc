var util = require('util');
var fs = require('fs');
var gm = require('gm');
var rutil = require('./rutil');
var CnvManager = require('./cnvmanager');
var CnvProc = require('./cnvproc');
var RoseLoader = require('./roseloader');
var imageMagick = gm.subClass({ imageMagick: true });

function CnvTexture(options) {
  CnvProc.call(this, options, options.path);

  this.path = options.path;
  this.isShadowmap = options.isShadowmap;
  this.hiDdsPath = 'tex/hi/dds/' + this.name + '.dds';
  this.loDdsPath = 'tex/lo/png/' + this.name + '.png';
}
util.inherits(CnvTexture, CnvProc);

CnvTexture.prototype.getPaths = function() {
  return [this.hiDdsPath, this.loDdsPath];
};

CnvTexture.prototype.process = function(callback) {
  console.log('Processing Texture', this.path);

  // Debug No Tex Convert
  //return callback(null, false);

  fs.exists(CnvManager.genCachePath(this.hiDdsPath), function(exists) {
    // Don't bother regenerating all the textures...  Too expensive!
    if (exists) {
      return callback(null, false);
    }

    var procRemain = 1 + 2;
    function _doneOne() {
      procRemain--;
      if (procRemain === 0) {
        callback(null, true);
      }
    }

    var loScale = 25;
    if (this.isShadowmap) {
      //loScale = 50;
    }

    var sourcePath = RoseLoader.basePath + this.path;
    imageMagick(sourcePath).identify('%A', function(err, val) {
      var channels = 'RGB';
      if (val === 'True') {
        channels = 'RGBA';
      }

      imageMagick(sourcePath).channel(channels).out('-separate').resize(loScale,loScale,'%').out('-combine').write(CnvManager.genCachePath(this.loDdsPath), _doneOne);
      rutil.copyFile(sourcePath, CnvManager.genCachePath(this.hiDdsPath), _doneOne);
      _doneOne();
    }.bind(this));
  }.bind(this));
};

module.exports = CnvTexture;
