var RoseLoader = require('./roseloader');

function RDataTable() {
  this.rows = [];
}

RDataTable.load = function(path, callback) {
  RoseLoader.load(path, function(err, rh) {
    if (err) {
      return callback(err, null);
    }

    rh.skip(4);

    var dataOffset = rh.readUint32();
    var rowCount = rh.readUint32() - 1;
    var columnCount = rh.readUint32() - 1;

    rh.seek(dataOffset);

    var rows = [];
    for (var i = 0; i < rowCount; ++i) {
      var cols = [];
      for (var j = 0; j < columnCount; ++j) {
        cols.push(rh.readUint16Str());
      }
      rows.push(cols);
    }

    var out = new RDataTable();
    out.rows = rows;
    callback(null, out);
  });
};

module.exports = RDataTable;