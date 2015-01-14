'use strict';
var express = require('express');
var moment = require('moment');
var util = require('util');
/**
 * [exports 静态文件处理]
 * @param  {[type]} staticPath [静态文件所在目录]
 * @param  {[type]} maxAge     [maxAge时间（单位秒）]
 * @return {[type]}            [description]
 */
module.exports = function(staticPath, maxAge){
  var handler = express.static(staticPath);
  return function(req, res){
    if(maxAge){
      var sMaxAge = Math.min(3600, maxAge);
      res.set({
        'Expires' : moment().add(maxAge, 'seconds').toString(),
        'Cache-Control' : util.format('public, max-age=%d, s-maxage=%d', maxAge, sMaxAge),
        'Vary' : 'Accept-Encoding'
      });
    }else{
      res.set({
        'Cache-Control' : 'no-cache'
      });
    }
    handler(req, res, function(err){
      res.status(404).send('');
    });
  };
};