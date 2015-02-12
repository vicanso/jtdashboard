'use strict';
var url = require('url');
var querystring = require('querystring');
var _ = require('lodash');

module.exports = function(query){
  var arr = query.split('&');
  var result = {};
  _.forEach(arr, function(str){
    var tmpArr = str.split('=');
    result[tmpArr[0]] = tmpArr[1];
  });
  return function(req, res, next){
    var query = req.query;
    var valid = true;
    _.forEach(result, function(v, k){
      if(valid && query[k] !== v){
        valid = false;
      }
    });
    if(valid){
      next();
    }else{
      var urlInfo = url.parse(req.originalUrl);
      _.extend(query, result);
      res.status(302).redirect(urlInfo.pathname + '?' + querystring.stringify(query));
    }
  }
};