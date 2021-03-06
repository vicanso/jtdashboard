'use strict';
var requireTree = require('require-tree');
var controllers = requireTree('./controllers');
var express = require('express');
var routerHandler = require('./helpers/router');
var config = require('./config');
var router = express.Router();
var importer = require('./middlewares/importer');
var staticVerion = null;
var staticMerge = null;
var importerOptions = {
  prefix : config.staticUrlPrefix,
  versionMode : 1,
  srcPath : 'src'
};
try{
  staticVerion = require('./crc32');
  staticMerge = require('./merge');
}catch(err){
  console.error(err);
}
if(config.env !== 'development'){
  importerOptions.version = staticVerion;
  importerOptions.merge = staticMerge;
}

var addImporter = importer(importerOptions);
var session = require('./middlewares/session')();
var cacheQueryChecker = require('./middlewares/query_checker')('cache=false');

var routeInfos = [
  {
    route : '/',
    template : 'index',
    middleware : [addImporter],
    handler : controllers.home
  },
  {
    route : '/user',
    method : 'all',
    middleware : [cacheQueryChecker, session],
    handler : controllers.user
  },
  {
    route : '/dashboard',
    template : 'dashboard',
    middleware : [addImporter],
    handler : controllers.dashboard.view
  },
  {
    route : '/stats',
    template : 'stats/index',
    middleware : [addImporter],
    handler : controllers.stats.view,
  },
  {
    route : '/stats',
    method : 'post',
    middleware : [session],
    handler : controllers.stats.add
  },
  {
    route : '/log',
    template : 'log/index',
    middleware : [addImporter],
    handler : controllers.log.view
  },
  {
    route : '/stats/collection/:collection',
    handler : controllers.stats.get
  },
  {
    route : '/my/stats',
    middleware : [cacheQueryChecker, session],
    handler : controllers.stats.myStats
  },
  {
    method : 'post',
    route : '/httplog',
    handler : controllers.http_log
  },
  {
    method : 'post',
    route : '/exception',
    handler : controllers.exception
  },
  {
    method : 'post',
    route : '/statistics',
    handler : controllers.statistics
  },
  {
    route : '/redirect',
    handler : function(req, res){
      res.status(301).redirect('/');
    }
  },
  {
    route : '/glyphicon',
    template : 'glyphicon',
    middleware : [addImporter],
    handler : controllers.glyphicon
  }
];

routerHandler.init(router, routeInfos);

module.exports = router;

