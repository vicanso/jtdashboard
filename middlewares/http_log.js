'use strict';
var morgan = require('morgan');
var config = require('../config');
morgan.token('session', function(req){
  return req.cookies[config.session.name] || '';
});
morgan.token('uuid', function(req){
  return req.cookies.jtuuid;
});
module.exports = function(type){
  return morgan(type, {
    stream : {
      write : function(msg){
        console.log(msg.trim());
      }
    }
  });
};