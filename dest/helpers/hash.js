(function() {
  var async, crypto, fs, hash, hashDict;

  fs = require('fs');

  crypto = require('crypto');

  async = require('async');

  hashDict = {};

  hash = function(buf) {
    var shasum;
    shasum = crypto.createHash('sha1');
    shasum.update(buf);
    return shasum.digest('hex');
  };

  exports.createSync = function(file) {
    var buf, error, key;
    if (hashDict[file]) {
      return hashDict[file];
    }
    try {
      buf = fs.readFileSync(file);
    } catch (_error) {
      error = _error;
      return '';
    }
    key = hash(buf);
    hashDict[file] = key;
    return key;
  };

  exports.create = function(file, cbf) {
    if (hashDict[file]) {
      GLOBAL.setImmediate(function() {
        return cbf(null, hashDict[file]);
      });
      return;
    }
    return async.waterfall([
      function(cbf) {
        return fs.readFile(file, cbf);
      }, function(buf, cbf) {
        var key;
        key = hash(buf);
        hashDict[file] = key;
        return cbf(null, key);
      }
    ], cbf);
  };

}).call(this);
