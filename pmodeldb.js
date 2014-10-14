function PModelDb() {
  this.models = [];
}

PModelDb.prototype.serialize = function() {
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

    var matFlags = 0;
    matFlags |= (model.material.alphaEnabled ? (1 << 0) : 0);
    matFlags |= (model.material.twoSided ? (1 << 1) : 0);
    matFlags |= (model.material.alphaTest ? (1 << 2) : 0);
    matFlags |= (model.material.depthTest ? (1 << 3) : 0);
    matFlags |= (model.material.depthWrite ? (1 << 4) : 0);
    matFlags |= (model.material.blendOp << 5);
    matFlags |= (model.material.blendSrc << 11);
    matFlags |= (model.material.blendDest << 17);

    var mdlBuf = new Buffer(4*4);
    mdlBuf.writeUInt32LE(model.material.texture, 0);
    mdlBuf.writeUInt32LE(matFlags, 4);
    mdlBuf.writeUInt32LE(model.mesh, 8);
    mdlBuf.writeUInt32LE(model.anim, 12);
    out.push(mdlBuf);
    currentOffset += mdlBuf.length;
  }

  for (var i = 0; i < dataOffsets.length; ++i) {
    offsets.writeUInt32LE(dataOffsets[i], 4*i);
  }

  return Buffer.concat(out);
};

module.exports = PModelDb;
