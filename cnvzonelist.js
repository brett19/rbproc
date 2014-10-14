var util = require('util');
var CnvDataTable = require('./cnvdatatable');

function CnvZoneList() {
  CnvDataTable.call(this, {
    name: 'zones',
    cols: {
      zoneData: {type: 'ZoneFile', column: 1},
      decoModelDb: {type: 'SModelDb', column: 11},
      cnstModelDb: {type: 'SModelDb', column: 12},
      name: {type: 'StlText', column: 26}
    },
    rowCleaner: function(i, row) {
      if (i === 0 || !row[1] || row[1] === 'string') {
        return true;
      }
      // debug testing
      if (i !== 5) {
        return true;
      }
    },
    stb: '3DDATA/STB/LIST_ZONE.STB',
    stl: '3DDATA/STB/LIST_ZONE_S.STL'
  });
}
util.inherits(CnvZoneList, CnvDataTable);

module.exports = CnvZoneList;
