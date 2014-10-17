(function() {
  var async, config, debug, logger, moment, mongodb, _;

  mongodb = require('../helpers/mongodb');

  config = require('../config');

  async = require('async');

  moment = require('moment');

  _ = require('underscore');

  logger = require('../helpers/logger')(__filename);

  debug = require('debug')('jt.controllers');

  module.exports.getKeys = function(req, res, cbf) {
    var collection, mapOptions;
    collection = req.param('collection');
    mapOptions = {
      map: function() {
        return emit('key', this.key);
      },
      reduce: function(k, vals) {
        return {
          keys: Array.unique(vals)
        };
      }
    };
    return async.waterfall([
      function(cbf) {
        return mongodb.model(collection).mapReduce(mapOptions, function(err, result) {
          debug('map reduce: %j', result);
          return cbf(err, result);
        });
      }, function(result, cbf) {
        var keys, value, _ref;
        value = result != null ? (_ref = result[0]) != null ? _ref.value : void 0 : void 0;
        if (!value) {
          keys = [];
        } else if (!value.keys) {
          keys = [value];
        } else {
          keys = _.sortBy(value.keys, function(key) {
            return key;
          });
        }
        return cbf(null, keys);
      }
    ], cbf);
  };

}).call(this);
