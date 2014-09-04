config = require '../config'
redisConfig = config.redis
redis = require 'redis'
client = redis.createClient redisConfig.port, redisConfig.host, {
  auth_pass : redisConfig.password
}
logger = require('./logger') __filename

client.on 'ready', ->
  logger.info 'ready'

client.on 'connect', ->
  logger.info 'connect'

client.on 'error', (err) ->
  logger.error "error: #{err.message}"

module.exports = client