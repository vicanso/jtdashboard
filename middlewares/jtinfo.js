'use strict';
var os = require('os');
var onHeaders = require('on-headers');
var util = require('util');
/**
 * [exports 添加信息到response header]
 * @param  {[type]} processName [description]
 * @return {[type]}             [description]
 */
module.exports = function(processName){
  var requestTotal = 0;
  var handlingReqTotal = 0;
  var hostname = os.hostname();
  return function(req, res, next){
    var start = Date.now();
    handlingReqTotal++;
    requestTotal++;
    onHeaders(res, function(){
      var jtInfo = util.format('%s,%s,%d,%d,%d,%d', hostname, processName, process.pid, handlingReqTotal, requestTotal, Date.now() - start);
      handlingReqTotal--;
      res.set('JT-Info', jtInfo);
    });
    next();
  };
};