(function() {
  var config, mongodb;

  mongodb = require('../helpers/mongodb');

  config = require('../config');

  module.exports = function(req, res, cbf) {
    return cbf(null, {
      viewData: {
        page: 'home'
      }
    });
  };

}).call(this);
