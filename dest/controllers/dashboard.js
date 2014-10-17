(function() {
  var Set, async, config, mongodb, _;

  mongodb = require('../helpers/mongodb');

  config = require('../config');

  async = require('async');

  Set = mongodb.model('stats_set');

  _ = require('underscore');

  module.exports = function(req, res, cbf) {
    return async.waterfall([
      function(cbf) {
        return Set.find({}, cbf);
      }, function(docs, cbf) {
        docs = _.map(docs, function(doc) {
          return doc.toObject();
        });
        return cbf(null, {
          viewData: {
            page: 'dashboard',
            globalVariable: {
              setList: docs
            }
          }
        });
      }
    ], cbf);
  };

}).call(this);
