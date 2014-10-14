var util = require('util');
var fs = require('fs');
var rutil = require('./rutil');
var CnvManager = require('./cnvmanager');
var CnvProc = require('./cnvproc');
var CnvTexture = require('./cnvtexture');
var CnvMesh = require('./cnvmesh');
var CnvAnimation = require('./cnvanimation');
var CnvEffect = require('./cnveffect');
var RModelDb = require('./rmodeldb');
var SModelDb = require('./smodeldb');
var Vector3 = require('./vector3');
var Quaternion = require('./quaternion');

function CnvSModelDb(options) {
  CnvProc.call(this, options, options.path);

  this.path = options.path;
  this.smdbPath = 'smodeldb/' + this.name;
}
util.inherits(CnvSModelDb, CnvProc);

CnvSModelDb.prototype.getPaths = function() {
  return [this.smdbPath];
};

CnvSModelDb.prototype.process = function(callback) {
  console.log('Processing Static Model Db', this.path);

  RModelDb.load(this.path, function(err, zscData) {

    var smdb = new SModelDb();

    for (var i = 0; i < zscData.models.length; ++i) {
      var zscModel = zscData.models[i];
      if (!zscModel || zscModel.parts.length < 0) {
        smdb.models.push(null);
        continue;
      }

      var model = {
        parts: [],
        effects: []
      };

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
        var animHash = 0;
        if (zscPart.animPath) {
          var anim = CnvManager.register(CnvAnimation, {
            path: rutil.normalizePath(zscPart.animPath)
          });
          animHash = anim.hash;
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
          anim: animHash,
          position: zscPart.position ? zscPart.position : new Vector3(0,0,0),
          rotation: zscPart.rotation ? zscPart.rotation : new Quaternion(0,0,0,1),
          scale: zscPart.scale ? zscPart.scale : new Vector3(0,0,0),
          parent: zscPart.parent ? zscPart.parent - 1 : 0,
          collisionMode: zscPart.collisionMode ? zscPart.collisionMode : 0
        });
      }

      for (var j = 0; j < zscModel.effects.length; ++j) {
        var zscEffect = zscModel.effects[j];

        var effect = CnvManager.register(CnvEffect, {
          path: rutil.normalizePath(zscData.effects[zscEffect.effectIdx])
        });

        model.effects.push({
          effect: effect.hash,
          position: zscEffect.position ? zscEffect.position : new Vector3(0,0,0),
          rotation: zscEffect.rotation ? zscEffect.rotation : new Quaternion(0,0,0,1),
          scale: zscEffect.scale ? zscEffect.scale : new Vector3(0,0,0),
          parent: zscPart.parent ? zscPart.parent - 1 : 0
        });
      }

      smdb.models.push(model);
    }

    fs.writeFile(CnvManager.genCachePath(this.smdbPath), smdb.serialize(), function(err) {
      if (err) {
        throw err;
      }
      callback(null, true);
    }.bind(this));

  }.bind(this));
};

module.exports = CnvSModelDb;
