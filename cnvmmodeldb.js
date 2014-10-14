var util = require('util');
var fs = require('fs');
var util = require('util');
var rutil = require('./rutil');
var CnvManager = require('./cnvmanager');
var CnvProc = require('./cnvproc');
var CnvTexture = require('./cnvtexture');
var CnvMesh = require('./cnvmesh');
var CnvEffect = require('./cnveffect');
var CnvAnimation = require('./cnvanimation');
var RDataTable = require('./rdatatable');
var PModelDb = require('./pmodeldb');
var Vector3 = require('./vector3');
var Quaternion = require('./quaternion');

function CnvMModelDb(options) {
  CnvProc.call(this, options, 'morphs');

  this.mmdbPath = 'morphs';
}
util.inherits(CnvMModelDb, CnvProc);

CnvMModelDb.prototype.getPaths = function() {
  return [this.mmdbPath];
};

CnvMModelDb.prototype.process = function(callback) {
  console.log('Processing Morph Model Db');

  var stbPath = '3DDATA/STB/LIST_MORPH_OBJECT.STB';
  RDataTable.load(stbPath, function(err, stbData) {
    if (err) {
      throw err;
    }

    var pmdb = new PModelDb();

    for (var i = 0; i < stbData.rows.length; ++i) {
      var stbRow = stbData.rows[i];
      if (!stbRow || !stbRow[1] || !stbRow[2] || !stbRow[3]) {
        pmdb.models.push(null);
        continue;
      }

      var model = {
        material: {}
      };

      var mesh = CnvManager.register(CnvMesh, {
        path: rutil.normalizePath(stbRow[1])
      });
      var tex = CnvManager.register(CnvTexture, {
        path: rutil.normalizePath(stbRow[3]),
        isShadowmap: false
      });
      var anim = CnvManager.register(CnvAnimation, {
        path: rutil.normalizePath(stbRow[2])
      });

      model.material.texture = tex.hash;
      model.material.alphaEnabled = parseInt(stbRow[4]) !== 0;
      model.material.twoSided = parseInt(stbRow[5]) !== 0;
      model.material.alphaTest = parseInt(stbRow[6]) !== 0;
      model.material.depthTest = parseInt(stbRow[7]) !== 0;
      model.material.depthWrite = parseInt(stbRow[8]) !== 0;
      model.material.blendOp = parseInt(stbRow[9]);
      model.material.blendSrc = parseInt(stbRow[10]);
      model.material.blendDest = parseInt(stbRow[11]);
      model.mesh = mesh.hash;
      model.anim = anim.hash;

      pmdb.models.push(model);
    }

    fs.writeFile(CnvManager.genCachePath(this.mmdbPath), pmdb.serialize(), function(err) {
      if (err) {
        throw err;
      }
      callback(null, true);
    }.bind(this));
  }.bind(this));
};

module.exports = CnvMModelDb;
