'use strict';
var config = require('./config');
initLog();
var express = require('express');
var path = require('path');
var requireTree = require('require-tree');
var middlewares = requireTree('./middlewares');
var connectTimeout = require('connect-timeout');
var monitor = require('./helpers/monitor');
var mongodb = require('./helpers/mongodb');
var domain = require('domain');
var io = require('./helpers/io');




if(config.env === 'development'){
  initServer();
}else{
  var d = domain.create();
  d.on('error', function(err){
    console.error(err);
  });
  d.run(initServer);
}


function initLog(){
  var jtLogger = require('jtlogger');
  var util = require('util');
  var url = require('url');
  var logServerInfo = url.parse(config.logServerUri);
  jtLogger.appPath = __dirname + '/';
  if(config.env !== 'development'){
    jtLogger.logPrefix = util.format('[%s][%s]', config.app, config.processId);
  }
  jtLogger.add(jtLogger.transports.Console);
  jtLogger.add(jtLogger.transports.UDP, {
    host : logServerInfo.hostname,
    port : logServerInfo.port
  });
}

/**
 * [initAppSetting 初始化app的配置信息]
 * @param  {[type]} app [description]
 * @return {[type]}     [description]
 */
function initAppSetting(app){
  app.set('view engine', 'jade');
  app.set('trust proxy', true);
  app.set('views', path.join(__dirname, 'views'));
  app.locals.ENV = config.env;
  app.locals.STATIC_URL_PREFIX = config.staticUrlPrefix;
};

/**
 * [initMongodb 初始化mongodb]
 * @param  {[type]} uri [description]
 * @return {[type]}     [description]
 */
function initMongodb(uri){
  if(!uri){
    return ;
  }
  mongodb.init(uri);
  mongodb.initModels(path.join(__dirname, 'models'));
};


function initServer(){

  initMongodb(config.mongodbUri);

  //性能监控的间隔时间
  var monitorInterval = 10 * 1000;
  if(config.env === 'development'){
    monitorInterval = 30 * 1000;
  }
  monitor.start(monitorInterval);

  var app = express();
  var server = require('http').Server(app);
  io.init(server);

  initAppSetting(app);

  // http请求10秒超时
  var httpTimeout = 10 * 1000;
  if(config.env === 'development'){
    httpTimeout = 60 * 1000;
  }
  app.use(connectTimeout(httpTimeout));

  //用于varnish haproxy检测node server是否可用
  app.use('/ping', function(req, res){
    res.send('OK');
  });

  // http log
  var httpLoggerType = ':remote-addr ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
  if(config.env === 'development'){
    httpLoggerType = 'dev';
  }
  app.use(middlewares.http_log(httpLoggerType));

  // 添加一些信息到response header中
  app.use(middlewares.jtinfo(config.processId));

  //单位秒
  var staticMaxAge = 365 * 24 * 3600;
  var staticPath = config.staticPath;
  var staticUrlPrefix = config.staticUrlPrefix;
  if(config.env === 'development'){
    var jtDev = require('jtdev');
    app.use(staticUrlPrefix, middlewares.static_dev(path.join(staticPath, 'src')));
    staticMaxAge = 0;
    app.use(staticUrlPrefix, middlewares.static(path.join(staticPath, 'src'), staticMaxAge));
  }else{
    app.use(staticUrlPrefix + '/src', middlewares.static(path.join(staticPath, 'src'), 0));
    app.use(staticUrlPrefix, middlewares.static(path.join(staticPath, 'dest'), staticMaxAge));
  }


  app.use(require('method-override')());

  var bodyParser = require('body-parser');
  app.use(bodyParser.json());


  // admin的router
  app.use('/jt', middlewares.admin('6a3f4389a53c889b623e67f385f28ab8e84e5029'));

  // debug参数的处理，有_debug和_pattern等
  app.use(middlewares.debug());
  

  app.use(function(req, res, next){
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0');
    next();
  });

  app.use(require('./router'));

  app.use(require('./controllers/error'));
  server.listen(config.port);
  console.log('server listen on:' + config.port);
};

