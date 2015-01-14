var jtDev = require('jtdev');
module.exports = function(staticPath){
  var extCoverter = jtDev.ext.converter(staticPath);
  var stylusParser = jtDev.stylus.parser(staticPath);
  return function(req, res, next){
    extCoverter(req, res, function(err){
      if(err){
        next(err);
      }else{
        stylusParser(req, res, next);
      }
    });
  };
};