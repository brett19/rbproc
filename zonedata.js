function ZoneData() {
  this.tiles = [];
  this.chunks = [];
}

ZoneData.prototype.addTile = function(tex1, tex2, blendingMode) {
  for (var i = 0; i < this.tiles.length; ++i) {
    var tile = this.tiles[i];
    if (tile.blendingMode !== blendingMode || tile.tex1 !== tex1) {
      continue;
    }
    if (blendingMode !== 0xFFFFFFFF && tile.tex2 !== tex2) {
      continue;
    }
    return i;
  }
  this.tiles.push({
    tex1: tex1,
    tex2: tex2,
    blendingMode: blendingMode
  });
  return this.tiles.length - 1;
};

ZoneData.prototype.serialize = function() {
  var out = [];

  var header = new Buffer(4*2);
  header.writeUInt32LE(this.tiles.length, 0);
  header.writeUInt32LE(this.chunks.length, 4);
  out.push(header);

  var tileList = new Buffer(4*3*this.tiles.length);
  for (var i = 0; i < this.tiles.length; ++i) {
    var tile = this.tiles[i];
    tileList.writeUInt32LE(tile.tex1, i*4*3+0);
    tileList.writeUInt32LE(tile.tex2, i*4*3+4);
    tileList.writeUInt32LE(tile.blendingMode, i*4*3+8);
  }
  out.push(tileList);

  var chunkList = new Buffer(4*2*this.chunks.length);
  for (var i = 0; i < this.chunks.length; ++i) {
    var chunk = this.chunks[i];
    chunkList.writeUInt32LE(chunk.index, i*4*2+0);
    chunkList.writeUInt32LE(chunk.hash, i*4*2+4);
  }
  out.push(chunkList);

  return Buffer.concat(out);
};

module.exports = ZoneData;
