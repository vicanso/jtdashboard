'use strict';
var toobusy = require('toobusy-js');
var MB = 1024 * 1024;
var config = require('../config');
var processId = config.processId;
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
  
  console.info('process:%s memory.rss:%dMB', processId, rss);
  console.info('process:%s memory.heapTotal:%dMB', processId, heapTotal);
  console.info('process:%s memory.heapUsed:%dMB', processId, heapUsed);
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
    console.info('process:%s lag:%d', processId, lag);
    // TODO JTStats log
  }
  var timer = setTimeout(function(){
    lagLog(interval);
  }, interval);
  timer.unref();
};