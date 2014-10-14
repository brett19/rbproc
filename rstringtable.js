var RoseLoader = require('./roseloader');

function RStringTable() {
  this.keys = [];
  this.languages = [];
}

RStringTable.prototype.getByKey = function(lang, key) {
  return this.languages[lang][this.keys[key]];
};

RStringTable.load = function(path, callback) {
  RoseLoader.load(path, function(err, rh) {
    if (err) {
      return callback(err, null);
    }

    var magic = rh.readVarLenStr();

    var textCount = 0;
    if (magic === 'NRST01') {
      textCount = 1;
    } else if (magic === 'ITST01') {
      textCount = 2;
    } else if (magic === 'QEST01') {
      textCount = 4;
    } else {
      console.warn(magic);
      throw new Error('Unrecognized STL magic');
    }

    var entryCount = rh.readUint32();

    var keys = {};
    for (var i = 0; i < entryCount; ++i) {
      var key = rh.readVarLenStr();
      rh.skip(4);
      keys[key] = i;
    }

    var languageCount = rh.readUint32();
    var languages = [];
    for (var i = 0; i < languageCount; ++i) {
      var offset = rh.readUint32();
      var pos = rh.tell();

      rh.seek(offset);

      var textOffsets = [];
      for (var j = 0; j < entryCount; ++j) {
        textOffsets.push(rh.readUint32());
      }

      var entries = [];
      for (var j = 0; j < entryCount; ++j) {
        rh.seek(textOffsets[j]);

        var texts = [];
        for (var k = 0; k < textCount; ++k) {
          texts.push(rh.readVarLenStr());
        }

        entries.push(texts);
      }

      languages.push(entries);

      rh.seek(pos);
    }

    var out = new RStringTable();
    out.keys = keys;
    out.languages = languages;
    callback(null, out);
  });
};

module.exports = RStringTable;
