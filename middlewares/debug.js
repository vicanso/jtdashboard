'use strict';
var config = require('../config');
/**
 * [exports 将debug的参数配置到res.locals中]
 * @return {[type]} [description]
 */
module.exports = function(){
  return function(req, res, next){
    res.locals.DEBUG = req.query._debug !== undefined;
    res.locals.pretty = req.query._pretty !== undefined;
    var pattern = req.query._pattern;
    if(!pattern && config.env === 'development'){
      pattern = '*';
    }
    res.locals.PATTERN = pattern;
    next();
  };
};