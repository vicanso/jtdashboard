(function() {
  var client, config, logger, redis, redisConfig;

  config = require('../config');

  redisConfig = config.redis;

  redis = require('redis');

  client = redis.createClient(redisConfig.port, redisConfig.host, {
    auth_pass: redisConfig.password
  });

  logger = require('./logger')(__filename);

  client.on('ready', function() {
    return logger.info('ready');
  });

  client.on('connect', function() {
    return logger.info('connect');
  });

  client.on('error', function(err) {
    return logger.error("error: " + err.message);
  });

  module.exports = client;

}).call(this);
