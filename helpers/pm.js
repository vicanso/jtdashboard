'use strict';
var pm2 = require('pm2');
var config = require('../config');
var async = require('async');
var _ = require('lodash');
var moment = require('moment');

var getProcessInfos = function(processList){
  var app = config.app;
  var result = [];

  var format = function(ms){
    var seconds = Math.floor(ms / 1000);
    var str = '';
    var hour = 3600;
    var day = 24 * 3600;
    var minute = 60;
    if(seconds > day){
      str += (Math.floor(seconds / day) + 'd');
      seconds %= day;
    }

    if(seconds > hour){
      str += (Math.floor(seconds / hour) + 'h');
      seconds %= hour;
    }

    if(seconds > minute){
      str += (Math.floor(seconds / minute) + 'm');
      seconds %= minute;
    }

    str += (seconds + 's');

    return str;
  };

  _.forEach(processList, function(info){
    if(info.name === app){
      var pm2Env = info.pm2_env;
      result.push({
        pid : info.pid,
        id : pm2Env.pm_id,
        unstableRestarts : pm2Env.unstable_restarts,
        uptime : format(Date.now() - pm2Env.pm_uptime),
        restartTime : pm2Env.restart_time,
        createdAt : moment(pm2Env.created_at).format('YYYY-MM-DD HH:mm:ss'),
        pmUptime : moment(pm2Env.pm_uptime).format('YYYY-MM-DD HH:mm:ss'),
        status : pm2Env.status
      });
    }
  });
  return result;
};


/**
 * [list 列出所有进程]
 * @param  {[type]} cbf [description]
 * @return {[type]}     [description]
 */
exports.list = function(cbf){
  async.waterfall([
    pm2.connect,
    pm2.list,
    function(processList){
      var processInfos = getProcessInfos(processList);
      cbf(null, processInfos);
    }
  ], cbf);
};


/**
 * [restartAll 重新所有的进程]
 * @param  {[type]} cbf [description]
 * @return {[type]}     [description]
 */
exports.restartAll = function(cbf){
  var pid = process.pid;
  async.waterfall([
    exports.list,
    function(processList, cbf){
      _.forEach(processList, function(info){
        pm2.restart(info.id, _.noop);
        // if(info.pid === pid){
        //   console.log('delay pmid' + info.id);
        //   _.delay(function(){
        //     console.log('pmid' + info.id);
        //     pm2.gracefulReload(info.id, _.noop);
        //   }, 1000);
        // }else{
        //   pm2.gracefulReload(info.id, _.noop);
        // }
      });
      cbf();
    }
  ], cbf);
};