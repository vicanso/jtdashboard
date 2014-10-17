(function() {
  var async, config, logger, moment, mongodb, _;

  mongodb = require('../helpers/mongodb');

  config = require('../config');

  async = require('async');

  moment = require('moment');

  _ = require('underscore');

  logger = require('../helpers/logger')(__filename);

  module.exports = function(req, res, cbf) {
    var StatsConfig, get, id, method, save, update;
    StatsConfig = mongodb.model('stats_config');
    method = req.method;
    save = function(data, cbf) {
      return async.waterfall([
        function(cbf) {
          return StatsConfig.findOne({
            name: data.name
          }, cbf);
        }, function(doc, cbf) {
          var err;
          if (doc) {
            err = new Error('the name has exists');
            return cbf(err);
          } else {
            return new StatsConfig(data).save(function(err, doc) {
              return cbf(err, doc);
            });
          }
        }
      ], cbf);
    };
    update = function(id, data, cbf) {
      return StatsConfig.findByIdAndUpdate(id, data, cbf);
    };
    get = function(query, cbf) {
      if (!query) {
        cbf(new Error('query can not be null'));
        return;
      }
      return async.waterfall([
        function(cbf) {
          return StatsConfig.findOne(query, cbf);
        }, function(data, cbf) {
          return cbf(null, data);
        }
      ], cbf);
    };
    id = req.param('id');
    switch (method) {
      case 'POST':
        if (id) {
          return update(id, req.body, cbf);
        } else {
          return save(req.body, cbf);
        }
        break;
      case 'GET':
        return get(req.query, cbf);
    }
  };

}).call(this);
