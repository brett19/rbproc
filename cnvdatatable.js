var fs = require('fs');
var util = require('util');
var rutil = require('./rutil');
var CnvProc = require('./cnvproc');
var CnvManager = require('./cnvmanager');
var CnvZone = require('./cnvzone');
var CnvSModelDb = require('./cnvsmodeldb');
var RDataTable = require('./rdatatable');
var RStringTable = require('./rstringtable');
var IndexedDb = require('./indexeddb');
var StringDb = require('./stringdb');

function CnvDataTable(options) {
  CnvProc.call(this, options, options.stb);

  this.cols = {};
  for (var i in options.cols) {
    if (options.cols.hasOwnProperty(i)) {
      if (options.cols[i] instanceof Object) {
        this.cols[i] = options.cols[i];
      } else {
        this.cols[i] = {
          type: 'Integer',
          columns: options.cols[i]
        };
      }
    }
  }
  this.stb = options.stb;
  this.stl = options.stl;
  this.rowCleaner = options.rowCleaner;
  this.idbPath = 'db/' + this.name;
  this.sdbPath = 'strings/en/' + this.name;
}

CnvDataTable.prototype.getPaths = function() {
  return [this.idbPath, this.sdbPath];
};

CnvDataTable.prototype._setupIdbColumns = function(idb) {
  for (var i in this.cols) {
    if (this.cols.hasOwnProperty(i)) {
      var col = this.cols[i];
      var colType = 0;
      if (col.type === 'StlText') {
        colType = IndexedDb.ColumnType.StringIdx;
      } else if (col.type === 'StlDesc') {
        colType = IndexedDb.ColumnType.StringIdx;
      } else {
        colType = IndexedDb.ColumnType[col.type];
      }

      idb.cols.push({
        type: colType,
        name: i
      });
    }
  }
};

CnvDataTable.prototype.process = function(callback) {
  console.log('Processing IDB', this.stb);

  RDataTable.load(this.stb, function(err, stbData) {
    RStringTable.load(this.stl, function(err, stlData) {

      var idb = new IndexedDb();
      var sdb = new StringDb();
      this._setupIdbColumns(idb);

      for (var i = 0; i < stbData.rows.length; ++i) {
        var stbRow = stbData.rows[i];

        if (this.rowCleaner) {
          if (this.rowCleaner(i, stbRow)) {
            stbRow = null;
          }
        }
        if (!stbRow) {
          idb.rows[i] = null;
          continue;
        }

        var idbRow = {};

        for (var j in this.cols) {
          if (this.cols.hasOwnProperty(j)) {
            var colType = this.cols[j].type;
            var colIdx = this.cols[j].column;
            var stbVal = stbRow[colIdx];
            if (stbVal !== '') {
              if (colType === 'ZoneFile') {
                var zoneCnv = CnvManager.register(CnvZone, {
                  zon: rutil.normalizePath(stbVal)
                });
                idbRow[j] = zoneCnv.hash;
              } else if (colType === 'SModelDb') {
                var smdbCnv = CnvManager.register(CnvSModelDb, {
                  path: rutil.normalizePath(stbVal)
                });
                idbRow[j] = smdbCnv.hash;
              } else if (colType === 'StlText') {
                var stlText = stlData.getByKey(1, stbVal);
                if (stlText) {
                  idbRow[j] = sdb.add(stlText[0]);
                }
              } else {
                if (!(stbVal instanceof Number)) {
                  throw new Error('Value is not an integer!');
                }
                idbRow[j] = stbVal;
              }
            }
          }
        }

        idb.rows[i] = idbRow;
      }

      fs.writeFile(CnvManager.genCachePath(this.sdbPath), sdb.serialize(), function(err) {
        if (err) {
          throw err;
        }
        fs.writeFile(CnvManager.genCachePath(this.idbPath), idb.serialize(), function(err) {
          if (err) {
            throw err;
          }

          callback(null, true);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

module.exports = CnvDataTable;
