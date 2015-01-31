'use strict';
var _ = require('lodash');
module.exports = function(req, res, cbf){
  var ua = req.get('user-agent');
  var ip = req.ips[0] || req.ip;
  var data = req.body;
  var responseData = {
    msg : 'success'
  };
  if(!data){
    cbf(null, responseData);
    return;
  }
  var httpLog = 'ip:' + ip + ', ua:' + ua;
  _.forEach(data.success, function(tmp){
    console.log(httpLog + ', url:' + tmp.url + ', use:' + tmp.use);
  });
  _.forEach(data.error, function(tmp){
    console.error(httpLog + ', url:' + tmp.url + ', status:' + tmp.status + ', use:' + tmp.use);
  });
  cbf(null, responseData);
};