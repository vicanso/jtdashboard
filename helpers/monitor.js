'use strict';
var toobusy = null;
try{
  toobusy = require('toobusy');
}catch(err){
  console.error('require toobusy error:' + err.message);
}
var MB = 1024 * 1024;
var config = require('../config');
var processName = config.process;
exports.start = function(interval){
  memoryLog(interval);
  if(toobusy){
    lagLog(Math.ceil(interval / 10));
  }
};

var memoryLog = function(interval){
  var memoryUsage = process.memoryUsage();
  var rss = Math.floor(memoryUsage.rss / MB);
  var heapTotal = Math.floor(memoryUsage.heapTotal / MB);
  var heapUsed = Math.floor(memoryUsage.heapUsed / MB);
  
  console.info('memory.rss.%s.%d', processName, rss);
  console.info('memory.heapTotal.%s.%d', processName, heapTotal);
  console.info('memory.heapUsed.%s.%d', processName, heapUsed);
  // TODO JTStats log
  
  var timer = setTimeout(function(){
    memoryLog(interval);
  }, interval);
  timer.unref();
};

var lagTotal = 0;
var lagCount = 0;
var lagLog = function(interval){
  lagTotal += toobusy.lag();
  lagCount++;
  if(lagCount === 10){
    var lag = Math.ceil(lagTotal / lagCount);
    lagCount = 0;
    lagTotal = 0;
    console.info('lag.%s.%d', processName, lag);
    // TODO JTStats log
  }
  var timer = setTimeout(function(){
    lagLog(interval);
  }, interval);
  timer.unref();
};