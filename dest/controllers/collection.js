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
        return emit(this.key, 1);
      },
      reduce: function(k, vals) {
        return Array.sum(vals);
      }
    };
    return mongodb.model(collection).mapReduce(mapOptions, function(err, result) {
      var keys;
      if (err) {
        return cbf(err);
      } else {
        keys = _.pluck(result, '_id');
        _.sortBy(keys, function(key) {
          return key;
        });
        debug('keys: %j', keys);
        return cbf(err, keys);
      }
    });
  };

}).call(this);
