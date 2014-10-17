(function() {
  var JTStatsClient, client, config;

  config = require('../config');

  JTStatsClient = require('jtstats_client');

  client = new JTStatsClient({
    host: config.stats.host,
    port: config.stats.port,
    category: config.app
  });

  module.exports = client;

}).call(this);
