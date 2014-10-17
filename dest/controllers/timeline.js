(function() {
  var async, logger, _;

  _ = require('underscore');

  async = require('async');

  logger = require('../helpers/logger')(__filename);

  module.exports = function(req, res, cbf) {
    var data, ip, referer, ua;
    ua = req.header('user-agent');
    referer = req.header('referer');
    ip = req.ip;
    data = req.body;
    if (data) {
      logger.info("ip:" + ip + ", html use " + data.html + "ms, js use " + data.js + "ms, ua:" + ua + ", referer:" + referer);
    }
    return cbf(null, {
      msg: 'success'
    });
  };

}).call(this);
