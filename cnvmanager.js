var assert = require('assert');
var util = require('util');

function _CnvManager() {
  this.cnvs = [];
  this.cnvObjs = [];
  this.assets = {};
}

_CnvManager.prototype.register = function(cnvProc, options) {
  // Create the processor
  var cnvObj = new cnvProc(options);

  // Search for existing matching processor
  for (var i = 0; i < this.cnvObjs.length; ++i) {
    if (this.cnvObjs[i].hash === cnvObj.hash) {
      assert.deepEqual(this.cnvs[i][1], options, 'Hash collision!');
      return this.cnvObjs[i];
    }
  }

  // Add asset listings
  var paths = cnvObj.getPaths();
  for (var i = 0; i < paths.length; ++i) {
    this.assets[paths[i]] = cnvObj;
  }

  // Save it for later
  this.cnvs.push([cnvProc.name, options].concat(paths));
  this.cnvObjs.push(cnvObj);

  return cnvObj;
};

_CnvManager.prototype.process = function(path, callback) {
  var cnvObj = this.assets[path];
  if (!cnvObj) {
    throw new Error('Cannot process unknown resource!');
  }

  cnvObj.proccessed = true;
  cnvObj.process(callback);
};

var MAX_CONCURRENT_PROC = 400;
_CnvManager.prototype.processAll = function(callback) {
  var procActive = 0;
  var _processMore = function() {
    for (var i = 0; i < this.cnvObjs.length; ++i) {
      var cnvObj = this.cnvObjs[i];
      if (cnvObj.processed) {
        continue;
      }

      procActive++;
      cnvObj.processed = true;

      cnvObj.process(function(_counter) {
        _counter.val++;
        if (_counter.val > 1) {
          throw new Error('Converter called back more than once!');
        }
        setImmediate(function() {
          procActive--;
          _processMore();
        });
      }.bind(this, {val: 0}));

      if (procActive >= MAX_CONCURRENT_PROC) {
        break;
      }
    }

    if (procActive === 0) {
      callback(null, true);
    }
  }.bind(this);
  _processMore();
};

_CnvManager.prototype.genCachePath = function(relPath) {
  return 'D:/zz_test_nevo/cache/' + relPath;
};

_CnvManager.prototype.serialize = function() {
  return JSON.stringify(this.cnvs, null, '  ');
};

var CnvManager = new _CnvManager();
module.exports = CnvManager;