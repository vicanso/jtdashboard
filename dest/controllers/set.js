(function() {
  var Config, Set, add, async, config, get, mongodb, _;

  mongodb = require('../helpers/mongodb');

  config = require('../config');

  async = require('async');

  _ = require('underscore');

  Set = mongodb.model('stats_set');

  Config = mongodb.model('stats_config');

  get = function(id, cbf) {
    return async.waterfall([
      function(cbf) {
        return Set.findById(id, cbf);
      }, function(doc, cbf) {
        var fnList, ids;
        if (!doc) {
          cbf(new Error("can not find doc by " + id));
          return;
        }
        doc = doc.toObject();
        ids = _.pluck(doc.configs, 'id');
        fnList = _.map(ids, function(id) {
          return function(cbf) {
            Config.findById(id, cbf);
          };
        });
        return async.parallel(fnList, function(err, configs) {
          return cbf(err, doc, configs);
        });
      }, function(doc, configs, cbf) {
        _.each(configs, function(tmp, i) {
          doc.configs[i] = _.extend(tmp.toObject(), doc.configs[i]);
        });
        return cbf(null, doc);
      }
    ], cbf);
  };

  add = function(data, cbf) {
    return async.waterfall([
      function(cbf) {
        return Set.findOne({
          name: data.name
        }, cbf);
      }, function(doc, cbf) {
        if (doc) {
          return cbf(new Error('the name is exists'));
        } else {
          return new Set(data).save(cbf);
        }
      }
    ], cbf);
  };

  module.exports = function(req, res, cbf) {
    switch (req.method) {
      case 'POST':
        add(req.body, cbf);
        break;
      default:
        get(req.param('id'), cbf);
    }
  };

}).call(this);
