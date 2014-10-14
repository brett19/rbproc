var RoseLoader = require('./roseloader');

/**
 * @constructor
 * @property {String} name
 * @property {Number} type
 * @property {Number} width
 * @property {Number} height
 * @property {Number} gridCount
 * @property {Number} gridSize
 * @property {Number} startX
 * @property {Number} startY
 * @property {Boolean} underground
 * @property {String} backgroundMusicPath
 * @property {String} skyPath
 * @property {RZoneData.SpawnPoint[]} spawns
 * @property {RZoneData.Tile[]} tiles
 * @property {String[]} textures
 */
var RZoneData = function() {
  this.spawns = [];
  this.tiles = [];
  this.textures = [];
};


/**
 * @constructor
 * @property {THREE.Vector3} position
 * @property {String} name
 */
RZoneData.SpawnPoint = function() {
};


/**
 * @constructor
 * @property {Number} layer1
 * @property {Number} layer2
 * @property {Number} offset1
 * @property {Number} offset2
 * @property {Boolean} blend
 * @property {RZoneData.TILE_ROTATION} rotation
 * @property {Number} type
 */
RZoneData.Tile = function() {
};


/**
 * @enum {Number}
 * @readonly
 */
RZoneData.BLOCK = {
  INFO:         0,
  SPAWN_POINTS: 1,
  TEXTURES:     2,
  TILES:        3,
  ECONOMY:      4
};


/**
 * @enum {Number}
 * @readonly
 */
RZoneData.TILE_ROTATION = {
  NONE:                 0,
  FLIP_HORIZONTAL:      2,
  FLIP_VERTICAL:        3,
  FLIP_BOTH:            4,
  CLOCKWISE_90:         5,
  COUNTER_CLOCKWISE_90: 6
};


/**
 * @callback Zone~onLoad
 * @param {RZoneData} zone
 */

/**
 * @param {String} path
 * @param {Zone~onLoad} callback
 */
RZoneData.load = function(path, callback) {
  RoseLoader.load(path, function(err, rh) {
    if (err) {
      throw err;
    }

    var blocks, i, j, data;
    data = new RZoneData();

    blocks = rh.readUint32();
    for (i = 0; i < blocks; ++i) {
      var type, offset, pos, count;
      type   = rh.readUint32();
      offset = rh.readUint32();
      pos    = rh.tell();

      rh.seek(offset);
      switch(type) {
        case RZoneData.BLOCK.INFO:
          data.type      = rh.readUint32();
          data.width     = rh.readUint32();
          data.height    = rh.readUint32();
          data.gridCount = rh.readUint32();
          data.gridSize  = rh.readFloat();
          data.startX    = rh.readUint32();
          data.startY    = rh.readUint32();
          break;
        case RZoneData.BLOCK.SPAWN_POINTS:
          count = rh.readUint32();
          for (j = 0; j < count; ++j) {
            var spawn = new RZoneData.SpawnPoint();
            spawn.position = rh.readVector3().multiplyScalar(0.01);
            spawn.name     = rh.readUint8Str();
            data.spawns.push(spawn);
          }
          break;
        case RZoneData.BLOCK.TEXTURES:
          count = rh.readUint32();
          for (j = 0; j < count; ++j) {
            data.textures.push(rh.readUint8Str());
          }
          break;
        case RZoneData.BLOCK.TILES:
          count = rh.readUint32();
          for (j = 0; j < count; ++j) {
            var tile = new RZoneData.Tile();
            tile.layer1   = rh.readUint32();
            tile.layer2   = rh.readUint32();
            tile.offset1  = rh.readUint32();
            tile.offset2  = rh.readUint32();
            tile.blend    = rh.readUint32() !== 0;
            tile.rotation = rh.readUint32();
            tile.type     = rh.readUint32();
            data.tiles.push(tile);
          }
          break;
        case RZoneData.BLOCK.ECONOMY:
          data.name                = rh.readUint8Str();
          data.underground         = rh.readUint32() !== 0;
          data.backgroundMusicPath = rh.readUint8Str();
          data.skyPath             = rh.readUint8Str();
          break;

        default:
          console.warn('Encountered unknown ZON block type:', type);
          break;
      }
      rh.seek(pos);
    }
    callback(null, data);
  });
};

module.exports = RZoneData;
