var util = require('util');
var fs = require('fs');
var rutil = require('./rutil');
var CnvManager = require('./cnvmanager');
var CnvProc = require('./cnvproc');
var CnvTexture = require('./cnvtexture');
var CnvMesh = require('./cnvmesh');
var CnvEffect = require('./cnveffect');
var RModelDb = require('./rmodeldb');
var PModelDb = require('./pmodeldb');
var Vector3 = require('./vector3');
var Quaternion = require('./quaternion');

function CnvPModelDb(options) {
  CnvProc.call(this, options, options.path);

  this.path = options.path;
  this.forSkinning = options.forSkinning ? options.forSkinning : false;
  this.defAttachBone = options.defAttachBone;
  this.defAttachDummy = options.defAttachDummy;
  this.pmdbPath = 'pmodeldb/' + this.name;
}
util.inherits(CnvPModelDb, CnvProc);

CnvPModelDb.prototype.getPaths = function() {
  return [this.pmdbPath];
};

CnvPModelDb.prototype.process = function(callback) {
  console.log('Processing Character Model Db', this.path);

  RModelDb.load(this.path, function(err, zscData) {
    if (err) {
      throw err;
    }

    var pmdb = new PModelDb();

    for (var i = 0; i < zscData.models.length; ++i) {
      var zscModel = zscData.models[i];
      if (!zscModel || zscModel.parts.length < 0) {
        pmdb.models.push(null);
        continue;
      }

      var model = {
        parts: []
      };

      if (zscModel.effects.length > 0) {
        // Apparently this is normal... but not used, wtf...
        //console.warn('Character part with effects!', this.path, i);
      }

      for (var j = 0; j < zscModel.parts.length; ++j) {
        var zscPart = zscModel.parts[j];
        var zscMaterial = zscData.materials[zscPart.materialIdx];

        var mesh = CnvManager.register(CnvMesh, {
          path: rutil.normalizePath(zscData.meshes[zscPart.meshIdx])
        });
        var tex = CnvManager.register(CnvTexture, {
          path: rutil.normalizePath(zscMaterial.texturePath),
          isShadowmap: false
        });

        var boneIndex = zscPart.boneIndex;
        if (boneIndex === undefined) {
          boneIndex = this.defAttachBone;
        }
        var dummyIndex = zscPart.dummyIndex;
        if (dummyIndex === undefined) {
          dummyIndex = this.defAttachDummy;
        }
        var forSkinning = boneIndex === undefined && dummyIndex === undefined;
        if (this.forSkinning !== forSkinning) {
          console.warn(this.path, i, j, this.forSkinning, this.defAttachBone, this.defAttachDummy, forSkinning, boneIndex, dummyIndex);
          //throw new Error('ZSC Type says one thing, ZSC part says otherwise.');
        }
        var attachType = 0;
        var attachIndex = 0;
        if (!forSkinning) {
          if (boneIndex !== undefined && dummyIndex !== undefined) {
            throw new Error('Item bound to both bone and dummy!');
          } else if (boneIndex) {
            attachType = 1;
            attachIndex = boneIndex;
          } else if (dummyIndex) {
            attachType = 2;
            attachIndex = dummyIndex;
          }
        }

        model.parts.push({
          material: {
            texture: tex.hash,
            alphaEnabled: zscMaterial.alphaEnabled,
            twoSided: zscMaterial.twoSided,
            alphaTest: zscMaterial.alphaTestEnabled,
            depthTest: zscMaterial.depthTestEnabled,
            depthWrite: zscMaterial.depthWriteEnabled,
            useSpecular: zscMaterial.useSpecular,
            blendType: zscMaterial.blendType,
            alphaRef: zscMaterial.alphaRef / 256,
            opacity: zscMaterial.alpha
          },
          mesh: mesh.hash,
          attachType: attachType,
          attachIndex: attachIndex
        });
      }

      pmdb.models.push(model);
    }

    fs.writeFile(CnvManager.genCachePath(this.pmdbPath), pmdb.serialize(), function(err) {
      if (err) {
        throw err;
      }
      callback(null, true);
    }.bind(this));
  }.bind(this));
};

module.exports = CnvPModelDb;
