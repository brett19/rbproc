function StringDb() {
  this.strings = [];
}

StringDb.prototype.serialize = function() {
  var out = [];
  var currentOffset = 0;

  var header = new Buffer(4);
  header.writeUInt32LE(this.strings.length, 0);
  out.push(header);
  currentOffset += header.length;

  var offsets = new Buffer(4*this.strings.length);
  out.push(offsets);
  currentOffset += offsets.length;

  var stringOffsets = [];
  for (var i = 0; i < this.strings.length; ++i) {
    var thisVal = this.strings[i];
    var thisOffset = currentOffset;
    if (i > 0) {
      var existingIdx = this.strings.lastIndexOf(thisVal, i - 1);
      if (existingIdx !== -1) {
        thisOffset = stringOffsets[existingIdx];
      }
    }
    if (thisOffset === currentOffset) {
      var thisValLen = Buffer.byteLength(thisVal, 'utf8');
      var valBuf = new Buffer(2 + thisValLen);
      valBuf.writeUInt16LE(thisValLen, 0);
      valBuf.write(thisVal, 2, thisValLen, 'utf8');
      out.push(valBuf);
      currentOffset += 2 + thisValLen;
    }
    stringOffsets.push(thisOffset);
  }

  for (var i = 0; i < stringOffsets.length; ++i) {
    offsets.writeUInt32LE(stringOffsets[i], 4*i);
  }

  return Buffer.concat(out);
};

StringDb.prototype.add = function(text) {
  this.strings.push(text);
  return this.strings.length - 1;
};

module.exports = StringDb;
