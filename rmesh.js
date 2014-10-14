var RoseLoader = require('./roseloader');

function RMesh() {
  this.indices = null;
  this.positions = null;
  this.normals = null;
  this.tangents = null;
  this.colours = null;
  this.skin = null;
  this.texCoords = [];
}

RMesh.FORMAT = {
  NONE:         1 << 0,
  POSITION:     1 << 1,
  NORMAL:       1 << 2,
  COLOUR:       1 << 3,
  BLEND_WEIGHT: 1 << 4,
  BLEND_INDEX:  1 << 5,
  TANGENT:      1 << 6,
  UV1:          1 << 7,
  UV2:          1 << 8,
  UV3:          1 << 9,
  UV4:          1 << 10
};

RMesh._readMesh8 = function(rh, callback) {
  var mesh = new RMesh();

  var format = rh.readUint32();
  rh.skip(4*3*2);

  var boneCount = rh.readUint16();
  var boneMap = [];
  for (var i = 0; i < boneCount; ++i) {
    boneMap.push(rh.readUint16());
  }

  var vertexCount = rh.readUint16();
  mesh.positions = [];
  for (var i = 0; i < vertexCount; ++i) {
    mesh.positions.push(rh.readVector3());
  }

  if (format & RMesh.FORMAT.NORMAL) {
    mesh.normals = [];
    for (var i = 0; i < vertexCount; ++i) {
      mesh.normals.push(rh.readVector3());
    }
  }

  if (format & RMesh.FORMAT.COLOUR) {
    mesh.colours = [];
    for (var i = 0; i < vertexCount; ++i) {
      mesh.colours.push(rh.readColour4());
    }
  }

  if (format & (RMesh.FORMAT.BLEND_INDEX | RMesh.FORMAT.BLEND_WEIGHT)) {
    mesh.skin = {
      weights: [],
      bones: []
    };
    for (var i = 0; i < vertexCount; ++i) {
      var weights = [];
      weights.push(rh.readFloat());
      weights.push(rh.readFloat());
      weights.push(rh.readFloat());
      weights.push(rh.readFloat());
      mesh.skin.weights.push(weights);

      var boneIdxs = [];
      boneIdxs.push(rh.readUint16());
      boneIdxs.push(rh.readUint16());
      boneIdxs.push(rh.readUint16());
      boneIdxs.push(rh.readUint16());
      for (var j = 0; j < 4; ++j) {
        if (boneIdxs[j] < 0 || boneIdxs[j] >= boneMap.length) {
          throw new Error('This mesh is bullshit!');
        }
      }

      var bones = [];
      bones.push(boneMap[boneIdxs[0]]);
      bones.push(boneMap[boneIdxs[1]]);
      bones.push(boneMap[boneIdxs[2]]);
      bones.push(boneMap[boneIdxs[3]]);
      mesh.skin.bones.push(bones);
    }
  }

  if (format & RMesh.FORMAT.TANGENT) {
    mesh.tangents = [];
    for (var i = 0; i < vertexCount; ++i) {
      mesh.tangents.push(rh.readVector3());
    }
  }

  for (var j = 0; j < 4; ++j) {
    if (format & (RMesh.FORMAT.UV1 << j)) {
      var uvs = [];
      for (var i = 0; i < vertexCount; ++i) {
        uvs.push(rh.readVector2());
      }
      mesh.texCoords.push(uvs);
    }
  }

  var faceCount = rh.readUint16();
  mesh.indices = [];
  for (var i = 0; i < faceCount; ++i) {
    mesh.indices.push(rh.readUint16());
    mesh.indices.push(rh.readUint16());
    mesh.indices.push(rh.readUint16());
  }

  callback(null, mesh);
};

RMesh._readMesh6 = function(rh, callback) {
  var mesh = new RMesh();

  var format = rh.readUint32();
  rh.skip(4*3*2);

  var boneCount = rh.readUint32();
  var boneMap = [];
  for (var i = 0; i < boneCount; ++i) {
    rh.skip(4);
    boneMap.push(rh.readUint32());
  }

  var vertexCount = rh.readUint32();
  mesh.positions = [];
  for (var i = 0; i < vertexCount; ++i) {
    rh.skip(4);
    mesh.positions.push(rh.readVector3().multiplyScalar(0.01));
  }

  if (format & RMesh.FORMAT.NORMAL) {
    mesh.normals = [];
    for (var i = 0; i < vertexCount; ++i) {
      rh.skip(4);
      mesh.normals.push(rh.readVector3());
    }
  }

  if (format & RMesh.FORMAT.COLOUR) {
    mesh.colours = [];
    for (var i = 0; i < vertexCount; ++i) {
      rh.skip(4);
      mesh.colours.push(rh.readColour4());
    }
  }

  if (format & (RMesh.FORMAT.BLEND_INDEX | RMesh.FORMAT.BLEND_WEIGHT)) {
    mesh.skin = {
      weights: [],
      bones: []
    };
    for (var i = 0; i < vertexCount; ++i) {
      rh.skip(4);

      var weights = [];
      weights.push(rh.readFloat());
      weights.push(rh.readFloat());
      weights.push(rh.readFloat());
      weights.push(rh.readFloat());
      mesh.skin.weights.push(weights);

      var bones = [];
      bones.push(boneMap[rh.readUint32()]);
      bones.push(boneMap[rh.readUint32()]);
      bones.push(boneMap[rh.readUint32()]);
      bones.push(boneMap[rh.readUint32()]);
      mesh.skin.bones.push(bones);
    }
  }

  if (format & RMesh.FORMAT.TANGENT) {
    mesh.tangents = [];
    for (var i = 0; i < vertexCount; ++i) {
      rh.skip(4);
      mesh.tangents.push(rh.readVector3());
    }
  }

  for (var j = 0; j < 4; ++j) {
    if (format & (RMesh.FORMAT.UV1 << j)) {
      var uvs = [];
      for (var i = 0; i < vertexCount; ++i) {
        rh.skip(4);
        uvs.push(rh.readVector2());
      }
      mesh.texCoords.push(uvs);
    }
  }

  var faceCount = rh.readUint32();
  mesh.indices = [];
  for (var i = 0; i < faceCount; ++i) {
    rh.skip(4);
    mesh.indices.push(rh.readUint32());
    mesh.indices.push(rh.readUint32());
    mesh.indices.push(rh.readUint32());
  }

  callback(null, mesh);
};

RMesh.load = function(path, callback) {
  RoseLoader.load(path, function(err, rh) {
    if (err) {
      return callback(err, null);
    }

    var version = 0;
    var magic = rh.readString(8);
    if (magic === 'ZMS0005') {
      version = 5;
    } else if (magic === 'ZMS0006') {
      version = 6;
    } else if (magic === 'ZMS0007') {
      version = 7;
    } else if (magic === 'ZMS0008') {
      version = 8;
    }

    var mesh = null;
    if (version >= 7) {
      RMesh._readMesh8(rh, callback);
    } else if (version >= 5) {
      RMesh._readMesh6(rh, callback);
    } else {
      callback(new Error('Invalid header magic'), null);
    }
  })
};

module.exports = RMesh;
