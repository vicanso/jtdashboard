(function() {
  var program;

  program = require('commander');

  (function() {
    return program.version('0.0.1').option('-p, --port <n>', 'listen port', parseInt).option('--mongodb <n>', 'mongodb uri eg.mongodb://localhost:10020/test, mongodb://user:pwd@localhost:10020/test').option('--redis <n>', 'redis uri eg.redis://localhost:10010, redis://pwd@localhost:10010').option('--stats <n>', 'stats uri eg.stats://localhost:6000').parse(process.argv);
  })();

  exports.port = program.port || 10000;

  exports.env = process.env.NODE_ENV || 'development';

  exports.app = 'JT_DASHBOARD';


  /**
   * [staticUrlPrefix 静态文件url前缀]
   * @type {String}
   */

  exports.staticUrlPrefix = '/static';

  exports.staticHosts = exports.env === 'development' ? null : null;

  exports.redis = (function() {
    var redisUri, url, urlInfo;
    url = require('url');
    redisUri = program.redis || 'redis://localhost:10010';
    urlInfo = url.parse(redisUri);
    return {
      port: urlInfo.port,
      host: urlInfo.hostname,
      password: urlInfo.auth
    };
  })();

  exports.stats = (function() {
    var statsUri, url, urlInfo;
    url = require('url');
    statsUri = program.stats || 'stats://localhost:6000';
    urlInfo = url.parse(statsUri);
    return {
      port: urlInfo.port,
      host: urlInfo.hostname
    };
  })();

  exports.session = {
    secret: 'jenny&tree',
    key: 'vicanso',
    ttl: 3600 * 6
  };

  module.exports.mongodbUri = program.mongodb || 'mongodb://localhost:10020/stats';

}).call(this);
