function ZoneChunk() {
  this.tiles = [];
  this.heights = [];
  this.lightmapTex = null;
  this.objects = [];
  this.objectlms = [];
  this.effects = [];
  this.meshanims = [];
  this.waterplanes = [];
}

ZoneChunk.prototype.serialize = function() {
  var out = [];

  var header = new Buffer(4*5);
  header.writeUInt32LE(this.objects.length, 0);
  header.writeUInt32LE(this.objectlms.length, 4);
  header.writeUInt32LE(this.effects.length, 8);
  header.writeUInt32LE(this.meshanims.length, 12);
  header.writeUInt32LE(this.waterplanes.length, 16);
  out.push(header);

  var lmhash = new Buffer(4);
  lmhash.writeUInt32LE(this.lightmapTex, 0);
  out.push(lmhash);

  var heights = new Buffer(4*65*65);
  for (var i = 0; i < 65*65; ++i) {
    heights.writeFloatLE(this.heights[i], 4*i);
  }
  out.push(heights);

  var tiles = new Buffer(4*16*16);
  for (var i = 0; i < 16*16; ++i) {
    tiles.writeUInt32LE(this.tiles[i], 4*i);
  }
  out.push(tiles);

  for (var i = 0; i < this.objects.length; ++i) {
    var obj = this.objects[i];
    var buf = new Buffer(4*11);
    var modelKey = ((obj.isDeco?1<<31:0) | obj.objectId) >>> 0;
    buf.writeUInt32LE(modelKey, 0);
    buf.writeFloatLE(obj.position.x, 4);
    buf.writeFloatLE(obj.position.y, 8);
    buf.writeFloatLE(obj.position.z, 12);
    buf.writeFloatLE(obj.rotation.x, 16);
    buf.writeFloatLE(obj.rotation.y, 20);
    buf.writeFloatLE(obj.rotation.z, 24);
    buf.writeFloatLE(obj.rotation.w, 28);
    buf.writeFloatLE(obj.scale.x, 32);
    buf.writeFloatLE(obj.scale.y, 36);
    buf.writeFloatLE(obj.scale.z, 40);
    out.push(buf);
  }

  for (var i = 0; i < this.objectlms.length; ++i) {
    var objlm = this.objectlms[i];
    var buf = new Buffer(4*3);
    var partKey = (objlm.partId << 24) | objlm.objectId;
    var lmKey = (objlm.texObjectsPerAxis << 16) | objlm.texObjectNum;
    buf.writeUInt32LE(partKey, 0);
    buf.writeUInt32LE(objlm.texHash, 4);
    buf.writeUInt32LE(lmKey, 8);
    out.push(buf);
  }

  for (var i = 0; i < this.effects.length; ++i) {
    var effect = this.effects[i];
    var buf = new Buffer(4*11);
    buf.writeUInt32LE(effect.hash, 0);
    buf.writeFloatLE(effect.position.x, 4);
    buf.writeFloatLE(effect.position.y, 8);
    buf.writeFloatLE(effect.position.z, 12);
    buf.writeFloatLE(effect.rotation.x, 16);
    buf.writeFloatLE(effect.rotation.y, 20);
    buf.writeFloatLE(effect.rotation.z, 24);
    buf.writeFloatLE(effect.rotation.w, 28);
    buf.writeFloatLE(effect.scale.x, 32);
    buf.writeFloatLE(effect.scale.y, 36);
    buf.writeFloatLE(effect.scale.z, 40);
    out.push(buf);
  }

  for (var i = 0; i < this.meshanims.length; ++i) {
    var meshanim = this.meshanims[i];
    var buf = new Buffer(4*11);
    buf.writeUInt32LE(meshanim.meshanimId, 0);
    buf.writeFloatLE(meshanim.position.x, 4);
    buf.writeFloatLE(meshanim.position.y, 8);
    buf.writeFloatLE(meshanim.position.z, 12);
    buf.writeFloatLE(meshanim.rotation.x, 16);
    buf.writeFloatLE(meshanim.rotation.y, 20);
    buf.writeFloatLE(meshanim.rotation.z, 24);
    buf.writeFloatLE(meshanim.rotation.w, 28);
    buf.writeFloatLE(meshanim.scale.x, 32);
    buf.writeFloatLE(meshanim.scale.y, 36);
    buf.writeFloatLE(meshanim.scale.z, 40);
    out.push(buf);
  }

  for (var i = 0; i < this.waterplanes.length; ++i) {
    var waterplane = this.waterplanes[i];
    var buf = new Buffer(4*6);
    buf.writeFloatLE(waterplane.start.x, 0);
    buf.writeFloatLE(waterplane.start.y, 4);
    buf.writeFloatLE(waterplane.start.z, 8);
    buf.writeFloatLE(waterplane.end.x, 12);
    buf.writeFloatLE(waterplane.end.y, 16);
    buf.writeFloatLE(waterplane.end.z, 20);
    out.push(buf);
  }

  return Buffer.concat(out);
};

module.exports = ZoneChunk;
