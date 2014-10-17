(function() {
  var FileImporter, JTMerger, addImporter, config, controllers, crc32Config, getCacheController, merger, requireTree, routeInfos, router, setNoCache;

  router = require('./helpers/router');

  config = require('./config');

  requireTree = require('require-tree');

  controllers = requireTree('./controllers');

  FileImporter = require('jtfileimporter');

  JTMerger = require('jtmerger');

  if (config.env !== 'development') {
    crc32Config = require('./crc32.json');
    merger = new JTMerger(require('./merge.json'));
  }

  addImporter = function(req, res, next) {
    var fileImporter;
    fileImporter = new FileImporter(merger);
    if (res.locals.DEBUG) {
      fileImporter.debug(true);
    }
    fileImporter.hosts(config.staticHosts);
    if (crc32Config) {
      fileImporter.version(crc32Config);
    }
    fileImporter.prefix(config.staticUrlPrefix);
    res.locals.fileImporter = fileImporter;
    return next();
  };


  /**
   * [setNoCache 所有不可以缓存的GET请求，都应带上cache=false，方便haproxy判断该请求是否可以进入varnish]
   * @param {[type]}   req  [description]
   * @param {[type]}   res  [description]
   * @param {Function} next [description]
   */

  setNoCache = function(req, res, next) {
    var query, querystring, url, urlInfo;
    query = req.query;
    if (req.method === 'GET' && query.cache !== 'false') {
      query.cache = false;
      querystring = require('querystring');
      url = require('url');
      urlInfo = url.parse(req.url);
      return res.redirect(301, "" + urlInfo.pathname + "?" + (querystring.stringify(query)));
    } else {
      res.header('Cache-Control', 'no-cache, no-store');
      return next();
    }
  };

  getCacheController = function(ttl) {
    return function(req, res, next) {
      if (config.env === 'development') {
        res.header('Cache-Control', 'no-cache, no-store');
      } else {
        res.header('Cache-Control', "public, max-age=" + ttl);
      }
      return next();
    };
  };

  routeInfos = [
    {
      route: '/import/files',
      type: 'post',
      middleware: [setNoCache],
      handler: controllers.import_files
    }, {
      route: '/timeline',
      type: 'post',
      middleware: [setNoCache],
      handler: controllers.timeline
    }, {
      route: '/httplog',
      type: 'post',
      middleware: [setNoCache],
      handler: controllers.http_log
    }, {
      route: ['/', '/dashboard'],
      handler: controllers.dashboard,
      middleware: [getCacheController(600), addImporter],
      template: 'dashboard'
    }, {
      route: ['/add', '/add/:id'],
      handler: controllers.add,
      middleware: [getCacheController(600), addImporter],
      template: 'add'
    }, {
      route: '/configs',
      handler: controllers.configs,
      middleware: [addImporter],
      template: 'configs'
    }, {
      route: '/user',
      middleware: [setNoCache],
      handler: controllers.user
    }, {
      route: '/collection/:collection/keys',
      middleware: [getCacheController(600)],
      handler: controllers.collection.getKeys
    }, {
      route: '/stats',
      handler: controllers.stats
    }, {
      route: ['/config', '/config/:id'],
      type: 'post',
      middleware: [setNoCache],
      handler: controllers.config
    }, {
      route: '/config',
      type: 'get',
      middleware: [getCacheController(600)],
      handler: controllers.config
    }, {
      route: '/set',
      type: 'post',
      middleware: [setNoCache],
      handler: controllers.set
    }, {
      route: '/set/:id',
      middleware: [getCacheController(600)],
      handler: controllers.set
    }, {
      route: '/readme',
      template: 'readme',
      middleware: [addImporter],
      handler: controllers.readme
    }
  ];

  module.exports.init = function(app) {
    return router.init(app, routeInfos);
  };

}).call(this);
