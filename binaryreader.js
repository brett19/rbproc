var fs = require('fs');
var Vector2 = require('./vector2');
var Vector3 = require('./vector3');
var Quaternion = require('./quaternion');
var Colour3 = require('./colour3');
var Colour4 = require('./colour4');

function BinaryReader(buffer) {
  this.buffer = buffer;
  this.pos = 0;
}

BinaryReader.prototype.tell = function() {
  return this.pos;
};

BinaryReader.prototype.seek = function(pos) {
  this.pos = pos;
};

BinaryReader.prototype.skip = function(num) {
  this.pos += num;
};

function _mapBufferFunc(func, readSize) {
  return function() {
    var val = func.call(this.buffer, this.pos);
    this.pos += readSize;
    return val;
  };
}
BinaryReader.prototype.readUint8 = _mapBufferFunc(Buffer.prototype.readUInt8, 1);
BinaryReader.prototype.readUint16 = _mapBufferFunc(Buffer.prototype.readUInt16LE, 2);
BinaryReader.prototype.readUint32 = _mapBufferFunc(Buffer.prototype.readUInt32LE, 4);
BinaryReader.prototype.readInt8 = _mapBufferFunc(Buffer.prototype.readInt8, 1);
BinaryReader.prototype.readInt16 = _mapBufferFunc(Buffer.prototype.readInt16LE, 2);
BinaryReader.prototype.readInt32 = _mapBufferFunc(Buffer.prototype.readInt32LE, 4);
BinaryReader.prototype.readFloat = _mapBufferFunc(Buffer.prototype.readFloatLE, 4);

BinaryReader.prototype.readString = function(length) {
  var strLen = 0;
  while(this.buffer[this.pos + strLen] !== 0 && strLen < length) {
    strLen++;
  }
  var val = this.buffer.toString('utf8', this.pos, this.pos + strLen);
  this.pos += length;
  return val;
};

BinaryReader.prototype.readNtString = function() {
  var strLen = 0;
  while(this.buffer[this.pos + strLen] !== 0) {
    strLen++;
  }
  var val = this.buffer.toString('utf8', this.pos, this.pos + strLen);
  this.pos += strLen + 1;
  return val;
};

BinaryReader.prototype.readUint8Str = function() {
  var strLen = this.readUint8();
  return this.readString(strLen);
};

BinaryReader.prototype.readUint16Str = function() {
  var strLen = this.readUint16();
  return this.readString(strLen);
};

BinaryReader.prototype.readVarLenStr = function() {
  var chr = this.readUint8();
  var length = chr & 0x7f;
  var shift = 7;

  while (chr & 0x80) {
    chr = this.readUint8();
    length |= (chr & 0x7f) << shift;
    shift += 7;
  }

  return this.readString(length);
};

BinaryReader.prototype.readIntVector2 = function() {
  var val = new Vector2();
  val.x = this.readInt32();
  val.y = this.readInt32();
  return val;
};

BinaryReader.prototype.readVector2 = function() {
  var val = new Vector2();
  val.x = this.readFloat();
  val.y = this.readFloat();
  return val;
};

BinaryReader.prototype.readVector3 = function() {
  var val = new Vector3();
  val.x = this.readFloat();
  val.y = this.readFloat();
  val.z = this.readFloat();
  return val;
};

BinaryReader.prototype.readVector3xzy = function() {
  var val = new Vector3();
  val.x = this.readFloat();
  val.z = this.readFloat();
  val.y = this.readFloat();
  return val;
};

BinaryReader.prototype.readQuat = function() {
  var val = new Quaternion();
  val.x = this.readFloat();
  val.y = this.readFloat();
  val.z = this.readFloat();
  val.w = this.readFloat();
  return val;
};

BinaryReader.prototype.readQuatwxyz = function() {
  var val = new Quaternion();
  val.w = this.readFloat();
  val.x = this.readFloat();
  val.y = this.readFloat();
  val.z = this.readFloat();
  return val;
};

BinaryReader.prototype.readColour3 = function() {
  var val = new Colour3();
  val.r = this.readFloat();
  val.g = this.readFloat();
  val.b = this.readFloat();
  return val;
};

BinaryReader.prototype.readColour4 = function() {
  var val = new Colour4();
  val.r = this.readFloat();
  val.g = this.readFloat();
  val.b = this.readFloat();
  val.a = this.readFloat();
  return val;
};

BinaryReader.load = function(path, callback) {
  fs.readFile(path, function(err, data) {
    if (err) {
      return callback(err, null);
    }
    callback(null, new BinaryReader(data));
  })
};

module.exports = BinaryReader;
