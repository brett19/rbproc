var path = require('path');
var util = require('util');
var fs = require('fs');
var rutil = require('./rutil');
var CnvProc = require('./cnvproc');
var RoseLoader = require('./roseloader');
var LoadGroup = require('./loadgroup');
var CnvManager = require('./cnvmanager');
var CnvTexture = require('./cnvtexture');
var CnvEffect = require('./cnveffect');
var RZoneData = require('./rzonedata');
var RZoneChunk = require('./rzonechunk');
var RHeightData = require('./rheightdata');
var RTilemapData = require('./rtilemapdata');
var RLightmapData = require('./rlightmapdata');
var ZoneData = require('./zonedata');
var ZoneChunk = require('./zonechunk');

function CnvZone(options) {
  CnvProc.call(this, options, options.zon);

  this.zon = options.zon;
  this.zgiPath = 'zone/' + this.name;
}
util.inherits(CnvZone, CnvProc);

CnvZone.prototype.getPaths = function() {
  return [this.zgiPath];
};

CnvZone.prototype._processChunk = function(zonData, zgi, index, path, callback) {
  var hash = rutil.hashPath(path);
  var zciPath = 'zonechunk/' + hash.toString(16);
  var ifoPath = path + '.IFO';
  var himPath = path + '.HIM';
  var tilPath = path + '.TIL';
  var litPath = path + '/' + path.substr(-5) + '_PLANELIGHTINGMAP.DDS';
  var cnstLitPath = path + '/LIGHTMAP/BUILDINGLIGHTMAPDATA.LIT';
  var decoLitPath = path + '/LIGHTMAP/OBJECTLIGHTMAPDATA.LIT';

  RZoneChunk.load(ifoPath, function(err, ifoData) {
    if (err) {
      return callback(false, null);
    }

    LoadGroup.load([
      [RTilemapData, tilPath],
      [RHeightData, himPath],
      [RLightmapData, cnstLitPath],
      [RLightmapData, decoLitPath]
    ], function (errs, tilData, himData, cnstLitData, decoLitData) {
      if (errs) {
        throw errs;
      }

      var zci = new ZoneChunk();

      var lmTex = CnvManager.register(CnvTexture, {
        path: rutil.normalizePath(litPath),
        isShadowmap: true
      });
      zci.lightmapTex = lmTex.hash;

      for (var iy = 0; iy < 16; ++iy) {
        for (var ix = 0; ix < 16; ++ix) {
          var tile = zonData.tiles[tilData.map[(15 - iy) * 16 + ix].number];

          var tileIdx = 0;
          var tex1Cnv = CnvManager.register(CnvTexture, {
            path: rutil.normalizePath(zonData.textures[tile.layer1 + tile.offset1]),
            isShadowmap: false
          });
          if (!tile.blend) {
            tileIdx = zgi.addTile(tex1Cnv.hash, 0x00000000, 0xFFFFFFFF);
          } else {
            var tex2Cnv = CnvManager.register(CnvTexture, {
              path: rutil.normalizePath(zonData.textures[tile.layer2 + tile.offset2]),
              isShadowmap: false
            });
            tileIdx = zgi.addTile(tex1Cnv.hash, tex2Cnv.hash, tile.rotation);
          }

          zci.tiles.push(tileIdx);
        }
      }

      for (var ix = 0; ix < 65; ++ix) {
        for (var iy = 0; iy < 65; ++iy) {
          zci.heights.push(himData.map[(64 - iy) * 65 + ix]);
        }
      }

      var bldgBaseIdx = zci.objects.length;
      for (var i = 0; i < ifoData.buildings.length; ++i) {
        var obj = ifoData.buildings[i];
        zci.objects.push({
          objectId: obj.objectId,
          isDeco: false,
          position: obj.position,
          rotation: obj.rotation,
          scale: obj.scale
        });
      }

      var decoBaseIdx = zci.objects.length;
      for (var i = 0; i < ifoData.objects.length; ++i) {
        var obj = ifoData.objects[i];
        zci.objects.push({
          objectId: obj.objectId,
          isDeco: true,
          position: obj.position,
          rotation: obj.rotation,
          scale: obj.scale
        });
      }

      for (var i in cnstLitData.objects) {
        if (cnstLitData.objects.hasOwnProperty(i)) {
          var lmModel = cnstLitData.objects[i];

          for (var j in lmModel.parts) {
            if (lmModel.parts.hasOwnProperty(j)) {
              var lmPart = lmModel.parts[j];

              var lmTex = CnvManager.register(CnvTexture, {
                path: cnstLitData.textures[lmPart.lightmapIndex],
                isShadowmap: true
              });

              zci.objectlms.push({
                objectId: bldgBaseIdx + parseInt(i),
                partId: parseInt(j),
                texHash: lmTex.hash,
                texObjectNum: lmPart.objectIndex,
                texObjectsPerAxis: lmPart.objectsPerRow
              });
            }
          }
        }
      }

      for (var i in decoLitData.objects) {
        if (decoLitData.objects.hasOwnProperty(i)) {
          var lmModel = decoLitData.objects[i];

          for (var j in lmModel.parts) {
            if (lmModel.parts.hasOwnProperty(j)) {
              var lmPart = lmModel.parts[j];

              var lmTex = CnvManager.register(CnvTexture, {
                path: decoLitData.textures[lmPart.lightmapIndex],
                isShadowmap: true
              });

              zci.objectlms.push({
                objectId: decoBaseIdx + parseInt(i),
                partId: parseInt(j),
                texHash: lmTex.hash,
                texObjectNum: lmPart.objectIndex,
                texObjectsPerAxis: lmPart.objectsPerRow
              });
            }
          }
        }
      }

      for (var i = 0; i < ifoData.effects.length; ++i) {
        var effect = ifoData.effects[i];
        var effectFile = CnvManager.register(CnvEffect, {
          path: rutil.normalizePath(effect.filePath)
        });
        zci.effects.push({
          hash: effectFile.hash,
          position: effect.position,
          rotation: effect.rotation,
          scale: effect.scale
        });
      }

      for (var i = 0; i < ifoData.animations.length; ++i) {
        var anim = ifoData.animations[i];
        zci.meshanims.push({
          meshanimId: anim.objectId,
          position: anim.position,
          rotation: anim.rotation,
          scale: anim.scale
        });
      }

      for (var i = 0; i < ifoData.waterPlanes.length; ++i) {
        var waterPlane = ifoData.waterPlanes[i];
        zci.waterplanes.push({
          start: waterPlane.start,
          end: waterPlane.end
        });
      }

      fs.writeFile(CnvManager.genCachePath(zciPath), zci.serialize(), function (err) {
        if (err) {
          throw err;
        }

        zgi.chunks.push({
          index: index,
          hash: hash
        });
        callback(null, true);
      });
    });
  });
};

CnvZone.prototype.process = function(callback) {
  console.log('Processing Zone', this.zon);

  RZoneData.load(this.zon, function(err, zonData) {
    var zgi = new ZoneData();

    var zonDir = path.dirname(this.zon);
    { // Process all the chunks
      fs.readdir(RoseLoader.basePath + zonDir, function(err, files) {
        var chunkQueue = [];
        for (var i = 0; i < files.length; ++i) {
          if (files[i].length === 5 && files[i][2] === '_') {
            var chunkX = parseInt(files[i].substr(0, 2));
            var chunkY = parseInt(files[i].substr(3, 2));
            var chunkIdx = chunkX * 100 + chunkY;
            var chunkPath = zonDir + '/' + files[i];
            chunkQueue.push([zonData, zgi, chunkIdx, chunkPath]);
          }
        }

        (function _doOne() {
          if (chunkQueue.length === 0) {
            return _chunksDone.call(this);
          }
          var args = chunkQueue.shift();
          args.push(_doOne.bind(this));
          this._processChunk.apply(this, args);
        }).call(this);
      }.bind(this));
    }

    function _chunksDone() {
      fs.writeFile(CnvManager.genCachePath(this.zgiPath), zgi.serialize(), function(err) {
        if (err) {
          throw err;
        }
        callback(null, true);
      }.bind(this));
    }
  }.bind(this));
};

module.exports = CnvZone;
