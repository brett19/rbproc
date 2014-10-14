function FlagsBuffer(flagCount) {
  var uintCount = Math.ceil(flagCount / 32);
  this.buffer = new Buffer(4 * uintCount);
  this.buffer.fill(0);
}
FlagsBuffer.prototype.set = function(bit) {
  var whichBit = bit % 8;
  var whichByte = Math.floor(bit / 8);
  this.buffer[whichByte] |= 1 << whichBit;
};

function IndexedDb() {
  this.rows = [];
  this.cols = [];
}

IndexedDb.ColumnType = {
  Integer: 1,
  StringIdx: 2,
  ZoneFile: 15,
  SModelDb: 16
};

IndexedDb.prototype.serialize = function() {
  var currentOffset = 0;

  var headers = [];

  var info = new Buffer(4 * 2);
  info.writeUInt32LE(this.rows.length, 0);
  info.writeUInt32LE(this.cols.length, 4);
  headers.push(info);
  currentOffset += info.length;

  var offsets = new Buffer(4 * this.rows.length);
  headers.push(offsets);
  currentOffset += offsets.length;

  var colTypes = new Buffer(4 * this.cols.length);
  for (var i = 0; i < this.cols.length; ++i) {
    var colType = this.cols[i].type;
    colTypes.writeUInt32LE(colType, 4*i);
  }
  headers.push(colTypes);
  currentOffset += colTypes.length;

  for (var i = 0; i < this.cols.length; ++i) {
    var colName = this.cols[i].name;
    var colNameLen = Buffer.byteLength(colName, 'utf8');
    var colBuf = new Buffer(2 + colNameLen);
    colBuf.writeUInt16LE(colNameLen, 0);
    colBuf.write(colName, 2, colNameLen, 'utf8');
    headers.push(colBuf);
    currentOffset += 2 + colNameLen;
  }

  var padHeaderLen = Math.ceil(currentOffset / 4) * 4;
  currentOffset = padHeaderLen;

  var datas = [];
  var rowOffsets = [];
  for (var i = 0; i < this.rows.length; ++i) {
    var row = this.rows[i];
    if (!row) {
      rowOffsets.push(0xFFFFFFFF);
      continue;
    }
    rowOffsets.push(currentOffset);

    var flags = new FlagsBuffer(this.cols.length);
    datas.push(flags.buffer);
    currentOffset += flags.buffer.length;

    for (var j = 0; j < this.cols.length; ++j) {
      var colName = this.cols[j].name;
      var colValue = row[colName];
      if (colValue === undefined) {
        continue;
      }

      flags.set(j);
      var colBuf = new Buffer(4);
      colBuf.writeUInt32LE(colValue, 0);
      datas.push(colBuf);
      currentOffset += 4;
    }
  }

  for (var i = 0; i < rowOffsets.length; ++i) {
    offsets.writeUInt32LE(rowOffsets[i], 4*i);
  }

  var header = Buffer.concat(headers);
  var data = Buffer.concat(datas);
  var outBuf = new Buffer(padHeaderLen + data.length);
  outBuf.writeUInt32LE(0, padHeaderLen-4); // write 0's in the padding
  header.copy(outBuf, 0);
  data.copy(outBuf, padHeaderLen);

  return outBuf;
};

module.exports = IndexedDb;
