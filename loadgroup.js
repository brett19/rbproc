function LoadGroup() {
}

LoadGroup.load = function(files, callback) {
  var errors = [];
  var args = [];

  var filesLeft = 1;
  function _doneOne() {
    filesLeft--;
    if (filesLeft === 0) {
      if (errors.length > 0) {
        args.unshift(errors);
      } else {
        args.unshift(null);
      }
      callback.apply(this, args);
    }
  }
  for (var i = 0; i < files.length; ++i) {
    filesLeft++;
    (function(argIdx, file) {
      file[0].load(file[1], function(err, data) {
        if (err) {
          errors.push(err);
        }
        args[argIdx] = data;
        _doneOne();
      });
    })(i, files[i]);
  }
  _doneOne();
};

module.exports = LoadGroup;
