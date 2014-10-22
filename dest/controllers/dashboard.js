(function() {
  var StatsSet, async, config, mongodb, _;

  mongodb = require('../helpers/mongodb');

  config = require('../config');

  async = require('async');

  StatsSet = mongodb.model('stats_set');

  _ = require('underscore');

  module.exports = function(req, res, cbf) {
    return async.waterfall([
      function(cbf) {
        return StatsSet.find({}, cbf);
      }, function(docs, cbf) {
        return cbf(null, {
          viewData: {
            page: 'dashboard',
            globalVariable: {
              selectedSetId: req.param('id'),
              setList: docs
            }
          }
        });
      }
    ], cbf);
  };

}).call(this);
