function Mesh() {
  this.attributes = [];
}

// This array must be in descending order of 32-bit elementSizes.
Mesh.AttributeType = {
  Positions: 1,
  UVs1: 2,
  UVs2: 3,
  UVs3: 4,
  UVs4: 5,
  SkinWeights: 6,
  SkinIndices: 7,
  Indices: 8
};

Mesh.prototype.addAttribute = function(type, data) {
  var typeIdx = Mesh.AttributeType[type];
  if (typeIdx === undefined) {
    throw new Error('Unknown attribute type');
  }

  this.attributes.push({
    type: typeIdx,
    data: data
  });
};

Mesh.prototype.serialize = function() {
  this.attributes.sort(function(a, b) {
    return a.type - b.type;
  });

  var out = [];
  var currentOffset = 0;

  var header = new Buffer(4);
  header.writeUInt32LE(this.attributes.length, 0);
  out.push(header);
  currentOffset += header.length;

  var attribs = new Buffer(4*3*this.attributes.length);
  out.push(attribs);
  currentOffset += attribs.length;

  for (var i = 0; i < this.attributes.length; ++i) {
    var attrib = this.attributes[i];
    var offset = currentOffset;

    out.push(attrib.data);
    currentOffset += attrib.data.length;

    attribs.writeUInt32LE(attrib.type, 4*3*i+0);
    attribs.writeUInt32LE(offset, 4*3*i+4);
    attribs.writeUInt32LE(attrib.data.length, 4*3*i+8);
  }

  return Buffer.concat(out);
};

module.exports = Mesh;
