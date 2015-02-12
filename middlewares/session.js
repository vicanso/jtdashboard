'use strict';
var cookieParser = require('cookie-parser')();
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var config = require('../config');
var _ = require('lodash');

var sessionInfo = config.session;
var redisOptions = getRedisOptions(config.redisUri);
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
  return function(req, res, next){
    cookieParser(req, res, function(err){
      if(err){
        next(err);
      }else{
        sessionParser(req, res, next);
      }
    });
  };
};



function getRedisOptions(redisUri){
  var url = require('url');
  var redisInfo = url.parse(redisUri);
  var redisOptions = {
    host : redisInfo.hostname,
    port : redisInfo.port,
    pass : redisInfo.auth
  };
  return redisOptions;
}