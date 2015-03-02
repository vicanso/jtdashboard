'use strict';

var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var config = require('../config');
var _ = require('lodash');

var sessionInfo = config.session;
var redisOptions = config.serverList.redis;
if(process.env.REDIS_PWD){
  redisOptions.pass = process.env.REDIS_PWD;
}
if(sessionInfo.ttl){
  redisOptions.ttl = sessionInfo.ttl;
  delete sessionInfo.ttl;
}
var store = new RedisStore(redisOptions);
var sessionParser = session(_.extend({
  store : store,
  saveUninitialized : true,
  resave : false
}, sessionInfo));
module.exports = function(){
  return sessionParser;
};

