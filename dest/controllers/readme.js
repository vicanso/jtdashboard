(function() {
  var async, config, debug, mongodb, _;

  mongodb = require('../helpers/mongodb');

  config = require('../config');

  async = require('async');

  _ = require('underscore');

  debug = require('debug')('jt.controller.readme');

  module.exports = function(req, res, cbf) {
    return cbf(null, {
      viewData: {
        page: 'readme'
      }
    });
  };

}).call(this);
