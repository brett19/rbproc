function SModelDb() {
  this.models = [];
}

SModelDb.prototype.serialize = function() {
  var out = [];
  var currentOffset = 0;

  var header = new Buffer(4);
  header.writeUInt32LE(this.models.length, 0);
  out.push(header);
  currentOffset += header.length;

  var offsets = new Buffer(4 * this.models.length);
  out.push(offsets);
  currentOffset += offsets.length;

  var dataOffsets = [];
  for (var i = 0; i < this.models.length; ++i) {
    var model = this.models[i];
    if (!model) {
      dataOffsets.push(0xFFFFFFFF);
      continue;
    }
    dataOffsets.push(currentOffset);

    var mheader = new Buffer(4*2);
    mheader.writeUInt32LE(model.parts.length, 0);
    mheader.writeUInt32LE(model.effects.length, 4);
    out.push(mheader);
    currentOffset += mheader.length;

    for (var j = 0; j < model.parts.length; ++j) {
      var part = model.parts[j];

      var matFlags = 0;
      matFlags |= (part.material.alphaEnabled ? (1 << 0) : 0);
      matFlags |= (part.material.twoSided ? (1 << 1) : 0);
      matFlags |= (part.material.alphaTest ? (1 << 2) : 0);
      matFlags |= (part.material.depthTest ? (1 << 3) : 0);
      matFlags |= (part.material.depthWrite ? (1 << 4) : 0);
      matFlags |= (part.material.useSpecular ? (1 << 5) : 0);

      var partBuf = new Buffer(4*19);
      partBuf.writeUInt32LE(part.material.texture, 0);
      partBuf.writeUInt32LE(matFlags >>> 0, 4);
      partBuf.writeUInt32LE(part.material.blendType, 8);
      partBuf.writeFloatLE(part.material.alphaRef, 12);
      partBuf.writeFloatLE(part.material.opacity, 16);
      partBuf.writeUInt32LE(part.mesh, 20);
      partBuf.writeUInt32LE(part.anim, 24);
      partBuf.writeFloatLE(part.position.x, 28);
      partBuf.writeFloatLE(part.position.y, 32);
      partBuf.writeFloatLE(part.position.z, 36);
      partBuf.writeFloatLE(part.rotation.x, 40);
      partBuf.writeFloatLE(part.rotation.y, 44);
      partBuf.writeFloatLE(part.rotation.z, 48);
      partBuf.writeFloatLE(part.rotation.w, 52);
      partBuf.writeFloatLE(part.scale.x, 56);
      partBuf.writeFloatLE(part.scale.y, 60);
      partBuf.writeFloatLE(part.scale.z, 64);
      partBuf.writeUInt32LE(part.parent, 68);
      partBuf.writeUInt32LE(part.collisionMode, 72);
      out.push(partBuf);
      currentOffset += partBuf.length;
    }

    for (var j = 0; j < model.effects.length; ++j) {
      var effect = model.effects[j];

      var eftBuf = new Buffer(4*19);
      eftBuf.writeUInt32LE(effect.effect, 0);
      eftBuf.writeFloatLE(effect.position.x, 4);
      eftBuf.writeFloatLE(effect.position.y, 8);
      eftBuf.writeFloatLE(effect.position.z, 12);
      eftBuf.writeFloatLE(effect.rotation.x, 16);
      eftBuf.writeFloatLE(effect.rotation.y, 20);
      eftBuf.writeFloatLE(effect.rotation.z, 24);
      eftBuf.writeFloatLE(effect.rotation.w, 28);
      eftBuf.writeFloatLE(effect.scale.x, 32);
      eftBuf.writeFloatLE(effect.scale.y, 36);
      eftBuf.writeFloatLE(effect.scale.z, 40);
      eftBuf.writeUInt32LE(part.parent, 44);
      out.push(eftBuf);
      currentOffset += eftBuf.length;
    }
  }

  for (var i = 0; i < dataOffsets.length; ++i) {
    offsets.writeUInt32LE(dataOffsets[i], 4*i);
  }

  return Buffer.concat(out);
};

module.exports = SModelDb;
