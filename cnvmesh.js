var util = require('util');
var fs = require('fs');
var CnvManager = require('./cnvmanager');
var CnvProc = require('./cnvproc');
var RMesh = require('./rmesh');
var Mesh = require('./mesh');

function CnvMesh(options) {
  CnvProc.call(this, options, options.path);

  this.path = options.path;
  this.mshPath = 'mesh/' + this.name;
}
util.inherits(CnvMesh, CnvProc);

CnvMesh.prototype.getPaths = function() {
  return [this.mshPath];
};

CnvMesh.prototype.process = function(callback) {
  console.log('Processing Mesh', this.path);

  RMesh.load(this.path, function(err, zmsData) {
    if (err) {
      throw err;
    }

    var mesh = new Mesh();

    if (zmsData.positions) {
      var positions = new Buffer(4 * 3 * zmsData.positions.length);
      for (var i = 0; i < zmsData.positions.length; ++i) {
        positions.writeFloatLE(zmsData.positions[i].x, 4*3*i+0);
        positions.writeFloatLE(zmsData.positions[i].y, 4*3*i+4);
        positions.writeFloatLE(zmsData.positions[i].z, 4*3*i+8);
      }
      mesh.addAttribute('Positions', positions);
    }

    if (zmsData.skin) {
      var weights = new Buffer(4*4*zmsData.skin.weights.length);
      for (var i = 0; i < zmsData.skin.weights.length; ++i) {
        for (var j = 0; j < 4; ++j) {
          weights.writeFloatLE(zmsData.skin.weights[i][j], 4*4*i + 0);
        }
      }
      mesh.addAttribute('SkinWeights', weights);

      var boneIndices = new Buffer(4*4*zmsData.skin.bones.length);
      for (var i = 0; i < zmsData.skin.bones.length; ++i) {
        for (var j = 0; j < 4; ++j) {
          boneIndices.writeFloatLE(zmsData.skin.bones[i][j], 4*4*i + 0);
        }
      }
      mesh.addAttribute('SkinIndices', boneIndices);
    }

    for (var j = 0; j < zmsData.texCoords.length; ++j) {
      var zmsUvs = zmsData.texCoords[j];
      var uvs = new Buffer(4*2*zmsUvs.length);
      for (var i = 0; i < zmsUvs.length; ++i) {
        uvs.writeFloatLE(zmsUvs[i].x, 4*2*i+0);
        uvs.writeFloatLE(zmsUvs[i].y, 4*2*i+4);
      }
      if (j === 0) {
        mesh.addAttribute('UVs1', uvs);
      } else if (j === 1) {
        mesh.addAttribute('UVs2', uvs);
      } else if (j === 2) {
        mesh.addAttribute('UVs3', uvs);
      } else if (j === 3) {
        mesh.addAttribute('UVs4', uvs);
      } else {
        console.warn('Encountered unexpected number of TexCoords.')
        break;
      }
    }

    if (zmsData.indices) {
      var indices = new Buffer(2 * zmsData.indices.length);
      for (var i = 0; i < zmsData.indices.length; ++i) {
        indices.writeUInt16LE(zmsData.indices[i], 2*i);
      }
      mesh.addAttribute('Indices', indices);
    }

    fs.writeFile(CnvManager.genCachePath(this.mshPath), mesh.serialize(), function() {
      callback(null, true);
    }.bind(this));
  }.bind(this));
};

module.exports = CnvMesh;
