config = require '../config'
sessionConfig = config.session
cookieParser = require('cookie-parser') sessionConfig.key
expressSession = require 'express-session'
RedisStore = require('connect-redis') expressSession
redis = require './redis'

storeOptions =
  client : redis
  ttl : sessionConfig.ttl
session = expressSession {
  secret : sessionConfig.secret
  key : sessionConfig.key
  store : new RedisStore storeOptions
  resave : false
  saveUninitialized : false
}

module.exports = (req, res, next) ->
  cookieParser req, res, ->
    session req, res, next