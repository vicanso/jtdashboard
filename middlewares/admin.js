'use strict';
var crypto = require('crypto');
var fs = require('fs');
var express = require('express');
var path = require('path');
var async = require('async');
var pm = require('../helpers/pm');
var _ = require('lodash');

/**
 * [exports description]
 * @param  {[type]} token [description]
 * @return {[type]}       [description]
 */
module.exports = function(token){
  var validate = function(req, res, next){
    var key = req.param('key');
    var shasum = crypto.createHash('sha1');
    if(!key || token !== shasum.update(key).digest('hex')){
      res.status(401).send('Unauthorized');
    }else{
      next();
    }
  };
  var router = express.Router();
  //重启node
  router.get('/restart', validate, function(req, res){
    pm.restartAll(function(err){
      if(err){
        res.status(500).send(err.message);
      }else{
        res.status(200).json({msg : 'success'});
      }
    });
    // res.status(200).json({msg : 'success'});
    // var timer = setTimeout(function(){
    //   pm.restartAll(_.noop);
    // }, 1000);
  });


  // router.get('/workerinfos', validate, function(req, res){
  //   JTCluster.getWorkersInfo(function(err, infos){
  //     if(err){
  //       res.send(err);
  //     }else{
  //       res.json(infos);
  //     }
  //   });
  // });


  var appVersion = 'no version';
  var getVersion = function(cbf){
    fs.readFile(path.join(__dirname, '../version'), cbf);
  };
  getVersion(function(err, buf){
    if(buf){
      appVersion = buf.toString();
    }
  });
  //获取代码的版本与正在运行的版本
  router.get('/sys', validate, function(req, res){
    async.parallel({
      processes : pm.list,
      version : function(cbf){
        getVersion(function(err, buf){
          buf = buf || '';
          cbf(null, {
            running : appVersion,
            code : buf.toString()
          });
        });
      }
    }, function(err, result){
      if(err){
        res.status(500).send(err.message);
      }else{
        res.json(result);
      }
    });
  });
  return router;
};