var fs = require('fs');
var util = require('util');
var path = require('path');
var rutil = require('./rutil');
var StrToHashKey = require('./strtohashkey');
var RoseLoader = require('./roseloader');
var RDataTable = require('./rdatatable');
var RStringTable = require('./rstringtable');
var RTilemapData = require('./rtilemapdata');
var RZoneChunk = require('./rzonechunk');
var RHeightData = require('./rheightdata');
var RZoneData = require('./rzonedata');
var RLightmapData = require('./rlightmapdata');
var RModelDb = require('./rmodeldb');
var IndexedDb = require('./indexeddb');
var StringDb = require('./stringdb');
var ZoneData = require('./zonedata');
var ZoneChunk = require('./zonechunk');
var PModelDb = require('./pmodeldb');
var CnvManager = require('./cnvmanager');
var CnvProc = require('./cnvproc');
var CnvTexture = require('./cnvtexture');
var CnvMesh = require('./cnvmesh');
var CnvEffect = require('./cnveffect');
var CnvZone = require('./cnvzone');
var CnvDataTable = require('./cnvdatatable');
var CnvSModelDb = require('./cnvsmodeldb');
var CnvPModelDb = require('./cnvpmodeldb');
var CnvZoneList = require('./cnvzonelist');
var CnvMModelDb = require('./cnvmmodeldb');
var CnvNpcDb = require('./cnvnpcdb')
/*
function CnvItemList() {
  CnvDataTable.call(this, {
    name: 'item_arms',
    cols: {
      name: {type: 'StlText', column: 56}
    },
    rowCleaner: function(i, row) {
      if (i === 0 || !row[56]) {
        return true;
      }
    },
    stb: '3DDATA/STB/LIST_ARMS.STB',
    stl: '3DDATA/STB/LIST_ARMS_S.STL'
  });
}
util.inherits(CnvItemList, CnvDataTable);
*/





function processRoot() {
  var startTime = process.hrtime();
  {
    /*
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_MFACE.ZSC', defAttachBone: 4 });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_WFACE.ZSC', defAttachBone: 4 });
    for (var i = 0; i < 21; ++i) {
      CnvManager.register(CnvPModelDb, {path: '3DDATA/AVATAR/LIST_MHAIR_' + i + '.ZSC', defAttachBone: 4});
      CnvManager.register(CnvPModelDb, {path: '3DDATA/AVATAR/LIST_WHAIR_' + i + '.ZSC', defAttachBone: 4});
    }
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_MCAP.ZSC', defAttachDummy: 6 });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_WCAP.ZSC', defAttachDummy: 6 });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_MBODY.ZSC', forSkinning: true });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_WBODY.ZSC', forSkinning: true });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_MARMS.ZSC', forSkinning: true });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_WARMS.ZSC', forSkinning: true });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_MFOOT.ZSC', forSkinning: true });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_WFOOT.ZSC', forSkinning: true });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_MFACEITEM.ZSC', defAttachDummy: 4 });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_WFACEITEM.ZSC', defAttachDummy: 4 });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/AVATAR/LIST_BACK.ZSC', defAttachDummy: 3 });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/WEAPON/LIST_WEAPON.ZSC', forSkinning: false });
    CnvManager.register(CnvPModelDb, { path: '3DDATA/WEAPON/LIST_SUBWPN.ZSC', forSkinning: false });

    CnvManager.register(CnvZoneList);

    for (var i = 1; i <= 2; ++i) {
      var waterIdx = (i >= 10 ? '' : '0') + i;
      for (var j = 1; j <= 25; ++j) {
        var frameIdx = (j >= 10 ? '' : '0') + j;
        var waterId = waterIdx + '_' + frameIdx;
        CnvManager.register(CnvTexture, { path: '3DDATA/JUNON/WATER/OCEAN'+waterId+'.DDS', name: 'water_'+waterId });
      }
    }

    CnvManager.register(CnvMModelDb);
    */

    CnvManager.register(CnvNpcDb);

    // Process everything and dump an assets database!
    CnvManager.processAll(function () {
      console.log('Everything Processed');
      console.log('It took', process.hrtime(startTime));
      fs.writeFile(CnvManager.genCachePath('assets.json'), CnvManager.serialize(), function() {
        console.log('Asset list written.');
      });
    });
  }
}

var mkpaths = [
  'D:/zz_test_nevo/cache/',
  'D:/zz_test_nevo/cache/db/',
  'D:/zz_test_nevo/cache/smodeldb/',
  'D:/zz_test_nevo/cache/pmodeldb/',
  'D:/zz_test_nevo/cache/animation/',
  'D:/zz_test_nevo/cache/skeleton/',
  'D:/zz_test_nevo/cache/zone/',
  'D:/zz_test_nevo/cache/zonechunk/',
  'D:/zz_test_nevo/cache/strings/',
  'D:/zz_test_nevo/cache/strings/en/',
  'D:/zz_test_nevo/cache/mesh/',
  'D:/zz_test_nevo/cache/tex/',
  'D:/zz_test_nevo/cache/tex/hi/',
  'D:/zz_test_nevo/cache/tex/hi/dds/',
  'D:/zz_test_nevo/cache/tex/lo/',
  'D:/zz_test_nevo/cache/tex/lo/png/'
];

(function _doOneMk() {
  if (mkpaths.length === 0) {
    return processRoot();
  }
  fs.mkdir(mkpaths.shift(), _doOneMk);
})();
