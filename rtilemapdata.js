var RoseLoader = require('./roseloader');

/**
 * @constructor
 * @property {Number} width
 * @property {Number} height
 * @property {RTilemapData.Tile[]} map
 */
var RTilemapData = function() {
  this.map = [];
};


/**
 * @constructor
 * @property {Number} brush
 * @property {Number} index
 * @property {Number} set
 * @property {Number} number
 */
RTilemapData.Tile = function() {
};


/**
 * @callback Tilemap~onLoad
 * @param {RTilemapData} tilemap
 */

/**
 * @param {String} path
 * @param {Tilemap~onLoad} callback
 */
RTilemapData.load = function(path, callback) {
  RoseLoader.load(path, function(err, rh) {
    if (err) {
      return callback(err, null);
    }

    var data = new RTilemapData();
    data.width  = rh.readUint32();
    data.height = rh.readUint32();

    for (var i = 0; i < data.width * data.height; ++i) {
      var tile = new RTilemapData.Tile();
      tile.brush  = rh.readUint8();
      tile.index  = rh.readUint8();
      tile.set    = rh.readUint8();
      tile.number = rh.readUint32();
      data.map.push(tile);
    }

    callback(null, data);
  });
};

module.exports = RTilemapData;
