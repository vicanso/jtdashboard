'use strict';
var config = require('../config');

module.exports = function(err, req, res, next){
  if(req.accepts('application/json')){
    var data = {
      error : err.message,
      msg : err.msg
    };
    if(config.env !== 'production'){
      data.stack = err.stack;
    }
    res.status(500).json(data);
  }else{
    next(err);
  }

};