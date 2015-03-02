'use strict';
var path = require('path');
var program = require('commander');
var url = require('url');
var pkg = require('./package');
program.version(pkg.version)
  .option('-p, --port <n>', 'listen port', parseInt)
  .option('--stats <n>', 'stats uri, eg:stats://localhost:6000')
  .option('--redis <n>', 'redis uri, eg:redis://pwd@localhost:4000')
  .option('--mongodb <n>', 'mongodb uri eg:mongodb://user:pwd@black:5000/stats')
  .option('--log <n>', 'log server uri eg:log://localhost:2900')
  .parse(process.argv);


exports.port = program.port || 10000;

exports.env = process.env.NODE_ENV || 'development';

exports.app = 'jtdashboard';
exports.processId = process.env.pm_id || '-1';

// 静态文件url前缀
exports.staticUrlPrefix = '/static';

exports.staticPath = path.join(__dirname, 'statics');

exports.staticHosts = exports.env === 'development'? null : ['s1.vicanso.com', 's2.vicanso.com'];


// session的配置
exports.session = {
  secret : 'jenny&tree',
  name : 'vicanso',
  ttl : 3600 * 12
};



exports.serverConfigUrl = 'http://jt-service.oss-cn-shenzhen.aliyuncs.com/server.json';

if(exports.env === 'development'){
  exports.serverConfigUrl = 'http://jt-service.oss-cn-shenzhen.aliyuncs.com/dev_server.json';
}

