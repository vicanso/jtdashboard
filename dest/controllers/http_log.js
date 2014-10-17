(function() {
  var async, logger, _;

  _ = require('underscore');

  async = require('async');

  logger = require('../helpers/logger')(__filename);

  module.exports = function(req, res, cbf) {
    var data, ip, ua;
    ua = req.header('user-agent');
    ip = req.ip;
    data = req.body;
    if (data) {
      logger.info("ip:" + ip + ", ua:" + ua + ", data:" + (JSON.stringify(data)));
    }
    return cbf(null, {
      msg: 'success'
    });
  };

}).call(this);
