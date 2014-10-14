var util = require('util');
var fs = require('fs');
var rutil = require('./rutil');
var CnvDataTable = require('./cnvdatatable');
var CnvSkeleton = require('./cnvskeleton');
var CnvAnimation = require('./cnvanimation');
var CnvProc = require('./cnvproc');
var CnvManager = require('./cnvmanager');
var RModelDb = require('./rmodeldb');
var RNpcDb = require('./rnpcdb');
var NpcDb = require('./npcdb');

function CnvNpcDb(options) {
  CnvProc.call(this, options, 'npcs');

  this.ndbPath = 'npcs';
}
util.inherits(CnvNpcDb, CnvProc)

CnvNpcDb.prototype.getPaths = function() {
  return [this.ndbPath];
};

CnvNpcDb.prototype.process = function(callback) {
  console.log('Processing NPC Db');

  var zscPath = '3DDATA/NPC/PART_NPC.ZSC';
  var chrPath = '3DDATA/NPC/LIST_NPC.CHR';
  RModelDb.load(zscPath, function(err, zscData) {
    if (err) {
      throw err;
    }
    RNpcDb.load(chrPath, function(err, chrData) {
      if (err) {
        throw err;
      }

      var ndb = new NpcDb();

      for (var i = 0; i < chrData.characters.length; ++i) {
        var chrNpc = chrData.characters[i];
        if (!chrNpc || chrNpc.models.length < 0) {
          ndb.npcs.push(null);
          continue;
        }

        var npc = {
          animations: [],
          parts: [],
          effects: []
        };

        var skel = CnvManager.register(CnvSkeleton, {
          path: rutil.normalizePath(chrData.skeletons[chrNpc.skeletonIdx])
        });

        npc.skeleton = skel.hash;

        for (var j = 0; j < chrNpc.animations.length; ++j) {
          var chrAnim = chrNpc.animations[j];
          if (chrAnim.type < 0) {
            continue;
          }
          if (chrAnim.type > 20) {
            throw new Error('Unexpectedly girthy animation type');
          }

          while(npc.animations.length < chrAnim.type) {
            npc.animations.push(0);
          }

          var anim = CnvManager.register(CnvAnimation, {
            path: rutil.normalizePath(chrData.animations[chrAnim.animIdx])
          });
          npc.animations[chrAnim.type] = anim.hash;
        }

        for (var j = 0; j < chrNpc.models.length; ++j) {

        }

        ndb.npcs.push(npc);
      }

      fs.writeFile(CnvManager.genCachePath(this.ndbPath), ndb.serialize(), function(err) {
        if (err) {
          throw err;
        }
        callback(null, true);
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

module.exports = CnvNpcDb;
