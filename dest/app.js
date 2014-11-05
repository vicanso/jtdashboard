(function() {
  var JTCluster, JTStats, adminHandler, config, crypto, debugParamsHandler, express, fileHash, fs, initAppSetting, initMongod, initMonitor, initServer, logger, moment, path, requestStatistics, staticHandler, _,
    __slice = [].slice;

  path = require('path');

  config = require('./config');

  moment = require('moment');

  express = require('express');

  fs = require('fs');

  crypto = require('crypto');

  _ = require('underscore');

  JTCluster = require('jtcluster');

  JTStats = require('./helpers/stats');

  logger = require('./helpers/logger')(__filename);

  fileHash = require('./helpers/hash');


  /**
   * [initAppSetting 初始化app的配置]
   * @param  {[type]} app [description]
   * @return {[type]}     [description]
   */

  initAppSetting = function(app) {
    app.set('view engine', 'jade');
    app.set('trust proxy', true);
    app.set('views', "" + __dirname + "/views");
    app.locals.ENV = config.env;
    app.locals.STATIC_URL_PREFIX = config.staticUrlPrefix;
    app.locals.convertImgSrc = function(src) {
      var file, key, newSrc;
      newSrc = config.staticUrlPrefix + src;
      if (config.env === 'development') {
        return newSrc;
      } else {
        file = path.join(config.staticPath, src);
        key = fileHash.createSync(file);
        return "" + newSrc + "?v=" + key;
      }
    };
  };


  /**
   * [initMongod 初始化mongodb]
   * @return {[type]} [description]
   */

  initMongod = function() {
    var mongodb, uri;
    uri = config.mongodbUri;
    if (uri) {
      mongodb = require('./helpers/mongodb');
      mongodb.init(uri);
      return mongodb.initModels(path.join(__dirname, './models'));
    }
  };


  /**
   * [requestStatistics 请求统计]
   * @return {[type]} [description]
   */

  requestStatistics = function() {
    var handlingReqTotal;
    handlingReqTotal = 0;
    return function(req, res, next) {
      var startAt, stat;
      startAt = process.hrtime();
      handlingReqTotal++;
      JTStats.gauge("handlingReqTotal." + config.nodeName, handlingReqTotal);
      stat = _.once(function() {
        var data, diff, ms;
        diff = process.hrtime(startAt);
        ms = diff[0] * 1e3 + diff[1] * 1e-6;
        handlingReqTotal--;
        data = {
          responeseTime: ms.toFixed(3),
          statusCode: res.statusCode,
          url: req.url,
          handlingReqTotal: handlingReqTotal,
          contentLength: GLOBAL.parseInt(res.get('Content-Length'))
        };
        return logger.info(data);
      });
      res.on('finish', stat);
      res.on('close', stat);
      return next();
    };
  };


  /**
   * [initMonitor 初始化监控]
   * @return {[type]} [description]
   */

  initMonitor = function() {
    var MB, lagCount, lagLog, lagTotal, memoryLog, toobusy;
    MB = 1024 * 1024;
    memoryLog = function() {
      var heapTotal, heapUsed, memoryUsage, rss;
      memoryUsage = process.memoryUsage();
      rss = Math.floor(memoryUsage.rss / MB);
      heapTotal = Math.floor(memoryUsage.heapTotal / MB);
      heapUsed = Math.floor(memoryUsage.heapUsed / MB);
      JTStats.gauge("memory.rss." + config.nodeName, rss);
      JTStats.gauge("memory.heapTotal." + config.nodeName, heapTotal);
      JTStats.gauge("memory.heapUsed." + config.nodeName, heapUsed);
      return setTimeout(memoryLog, 10 * 1000);
    };
    lagTotal = 0;
    lagCount = 0;
    toobusy = require('toobusy');
    lagLog = function() {
      var lag;
      lagTotal += toobusy.lag();
      lagCount++;
      if (lagCount === 10) {
        lag = Math.ceil(lagTotal / lagCount);
        lagCount = 0;
        lagTotal = 0;
        JTStats.average("lag." + config.nodeName, lag);
      }
      return setTimeout(lagLog, 1000);
    };
    lagLog();
    return memoryLog();
  };

  debugParamsHandler = function() {
    return function(req, res, next) {
      var pattern;
      res.locals.DEBUG = req.param('__debug');
      pattern = req.param('__pattern');
      if (config.env === 'development' && !pattern) {
        pattern = '*';
      }
      res.locals.PATTERN = pattern;
      return next();
    };
  };


  /**
   * [adminHandler description]
   * @param  {[type]} app [description]
   * @return {[type]}     [description]
   */

  adminHandler = function(app) {
    var appVersion;
    app.get('/jt/restart', function(req, res) {
      var key, shasum, _ref;
      key = (_ref = req.query) != null ? _ref.key : void 0;
      if (key) {
        shasum = crypto.createHash('sha1');
        if ('6a3f4389a53c889b623e67f385f28ab8e84e5029' === shasum.update(key).digest('hex')) {
          res.header('Cache-Control', 'no-cache, no-store');
          res.status(200).json({
            msg: 'success'
          });
          return setTimeout(function() {
            return JTCluster.restartAll();
          }, 1000);
        } else {
          return res.status(500).json({
            msg: 'fail, the key is wrong'
          });
        }
      } else {
        return res.status(500).json({
          msg: 'fail, the key is null'
        });
      }
    });
    appVersion = '';
    fs.readFile(path.join(__dirname, 'version'), function(err, buf) {
      if (buf) {
        appVersion = buf.toString();
      }
    });
    return app.get('/jt/version', function(req, res) {
      var codeVersion;
      codeVersion = fs.readFileSync(path.join(__dirname, 'version'));
      return res.send({
        running: appVersion,
        version: codeVersion != null ? codeVersion.toString() : void 0
      });
    });
  };

  staticHandler = (function() {
    var expressStatic, serveStatic;
    expressStatic = 'static';
    serveStatic = express[expressStatic];

    /**
     * [staticHandler 静态文件处理]
     * @param  {[type]} app      [description]
     * @param  {[type]} mount      [description]
     * @param  {[type]} staticPath [description]
     * @return {[type]}            [description]
     */
    return function(app, mount, staticPath) {
      var expires, handler, hour, hourTotal, jtDev, staticMaxAge;
      handler = serveStatic(staticPath);
      hour = 3600;
      hourTotal = 30 * 24;
      expires = moment().add(moment.duration(hourTotal, 'hour')).toString();
      if (!process.env.NODE_ENV) {
        hour = 0;
        expires = '';
      }
      staticMaxAge = hourTotal * hour;
      if (config.env === 'development') {
        jtDev = require('jtdev');
        app.use(mount, jtDev.ext.converter(staticPath));
        app.use(mount, jtDev.stylus.parser(staticPath, {
          linenos: true
        }));
        app.use(mount, jtDev.coffee.parser(staticPath));
      }
      return app.use(mount, function(req, res, next) {
        if (expires) {
          res.header('Expires', expires);
        }
        res.header('Cache-Control', "public, max-age=" + staticMaxAge + ", s-maxage=" + hour);
        return handler(req, res, function(err) {
          if (err) {
            return next(err);
          }
          logger.error("" + req.url + " is not found!");
          return res.status(404).send('');
        });
      });
    };
  })();

  initServer = function() {
    var app, bodyParser, hostName, httpLogger, timeout;
    initMongod();
    app = express();
    initAppSetting(app);
    app.use('/ping', function(req, res) {
      res.send('success');
    });
    if (config.env !== 'development') {
      initMonitor();
      hostName = require('os').hostname();
      app.use(function(req, res, next) {
        res.header('JT-Info', "" + hostName + "," + process.pid + "," + config.nodeName);
        return next();
      });
      app.use(requestStatistics());
      httpLogger = require('./helpers/logger')('HTTP');
      app.use(require('morgan')('tiny', {
        stream: {
          write: function(msg) {
            return httpLogger.info(msg.trim());
          }
        }
      }));
    }
    timeout = require('connect-timeout');
    app.use(timeout(60 * 1000));
    staticHandler(app, '/static', config.staticPath);
    app.use(require('method-override')());
    bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({
      extended: false
    }));
    app.use(bodyParser.json());
    app.use(debugParamsHandler());
    adminHandler(app);
    require('./router').init(app);
    app.use(require('./controllers/error'));
    app.listen(config.port);
    return logger.info("server listen on: " + config.port);
  };

  process.on('exit', function(code) {
    return logger.error("process " + config.nodeName + " exit with code:" + code);
  });

  if (config.env === 'development') {
    initServer();
  } else {
    new JTCluster({
      handler: initServer,
      envs: [
        {
          jtProcessName: 'tg'
        }, {
          jtProcessName: 'cf'
        }
      ],
      error: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return logger.error.apply(logger, args);
      },
      log: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return logger.log.apply(logger, args);
      }
    });
  }

}).call(this);
