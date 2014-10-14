function NpcDb() {
  this.npcs = [];
}

NpcDb.prototype.serialize = function() {
  var out = [];
  var currentOffset = 0;

  var header = new Buffer(4);
  header.writeUInt32LE(this.npcs.length, 0);
  out.push(header);
  currentOffset += header.length;

  var offsets = new Buffer(4 * this.npcs.length);
  out.push(offsets);
  currentOffset += offsets.length;

  var dataOffsets = [];
  for (var i = 0; i < this.npcs.length; ++i) {
    var model = this.npcs[i];
    if (!model) {
      dataOffsets.push(0xFFFFFFFF);
      continue;
    }
    dataOffsets.push(currentOffset);


  }

  for (var i = 0; i < dataOffsets.length; ++i) {
    offsets.writeUInt32LE(dataOffsets[i], 4*i);
  }

  return Buffer.concat(out);
};

module.exports = NpcDb;
