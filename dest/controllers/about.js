(function() {
  var async, config, debug, mongodb, _;

  mongodb = require('../helpers/mongodb');

  config = require('../config');

  async = require('async');

  _ = require('underscore');

  debug = require('debug')('jt.controller.about');

  module.exports = function(req, res, cbf) {
    return cbf(null, {
      viewData: {
        page: 'about'
      }
    });
  };

}).call(this);
