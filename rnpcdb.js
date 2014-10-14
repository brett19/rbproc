var RoseLoader = require('./roseloader');

/**
 * @constructor
 * @param {String[]}                  skeletons
 * @param {String[]}                  animations
 * @param {String[]}                  effects
 * @param {CharacterList.Character[]} characters
 */
var CharacterList = function() {
  this.skeletons  = [];
  this.animations = [];
  this.effects    = [];
  this.characters = [];
};


/**
 * @constructor
 * @property {Number[]}                         models
 * @property {Object}                           animations
 * @property {CharacterList.Character.Effect[]} effects
 */
CharacterList.Character = function() {
  this.models     = [];
  this.animations = [];
  this.effects    = [];
};


/**
 * @constructor
 * @property {Number} boneIdx
 * @property {Number} effectIdx
 */
CharacterList.Character.Effect = function() {
};


/**
 * @callback CharacterList~onLoad
 * @param {CharacterList} characterList
 */

/**
 * @param {String} path
 * @param {CharacterList~onLoad} callback
 */
CharacterList.load = function(path, callback) {
  RoseLoader.load(path, function (err, rh) {
    if (err) {
      return callback(err, null);
    }

    var characters, count, i, j;
    var data = new CharacterList();

    count = rh.readUint16();
    for (i = 0; i < count; ++i) {
      data.skeletons.push(rh.readNtString());
    }

    count = rh.readUint16();
    for (i = 0; i < count; ++i) {
      data.animations.push(rh.readNtString());
    }

    count = rh.readUint16();
    for (i = 0; i < count; ++i) {
      data.effects.push(rh.readNtString());
    }

    characters = rh.readUint16();
    for (i = 0; i < characters; ++i) {
      var character = null;

      if (!!rh.readUint8()) {
        character = new CharacterList.Character();
        character.skeletonIdx = rh.readUint16();
        character.name = rh.readNtString();

        count = rh.readUint16();
        for (j = 0; j < count; ++j) {
          character.models.push(rh.readUint16());
        }

        count = rh.readUint16();
        for (j = 0; j < count; ++j) {
          var type = rh.readInt16();
          var animIdx = rh.readUint16();
          character.animations.push({
            type: type,
            animIdx: animIdx
          });
        }

        count = rh.readUint16();
        for (j = 0; j < count; ++j) {
          var effect = new CharacterList.Character.Effect();
          effect.boneIdx   = rh.readUint16();
          effect.effectIdx = rh.readUint16();
          character.effects.push(effect);
        }
      }

      data.characters.push(character);
    }

    callback(null, data);
  });
};

module.exports = CharacterList;
