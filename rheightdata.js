var RoseLoader = require('./roseloader');

/**
 * @constructor
 * @property {Number}   width
 * @property {Number}   height
 * @property {Number}   gridCount
 * @property {Number}   patchSize
 * @property {Number[]} map
 */
var HeightmapData = function() {
  this.map = [];
};

/**
 * @callback Heightmap~onLoad
 * @param {HeightmapData} heightmap
 */

/**
 * @param {String} path
 * @param {Heightmap~onLoad} callback
 */
HeightmapData.load = function(path, callback) {
  RoseLoader.load(path, function(err, rh) {
    if (err) {
      return callback(err, null);
    }

    var i, data;

    data = new HeightmapData();
    data.width     = rh.readUint32();
    data.height    = rh.readUint32();
    data.gridCount = rh.readUint32();
    data.patchSize = rh.readFloat();

    for (i = 0; i < data.width * data.height; ++i) {
      data.map.push(rh.readFloat());
    }

    callback(null, data);
  });
};

module.exports = HeightmapData;
