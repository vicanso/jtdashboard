'use strict';
var path = require('path');
var program = require('commander');
var url = require('url');
var pkg = require('./package');
program.version(pkg.version)
  .option('-p, --port <n>', 'listen port', parseInt)
  .parse(process.argv);


exports.port = program.port || 10000;

exports.env = process.env.NODE_ENV || 'development';

exports.app = 'express_base';
exports.process = process.env.pm_id || '-1';

// 静态文件url前缀
exports.staticUrlPrefix = '/static';

exports.staticPath = path.join(__dirname, 'statics');

exports.staticHosts = exports.env === 'development'? null : ['s1.vicanso.com', 's2.vicanso.com'];

// redis服务器的配置

exports.redis = {
  port : 4000,
  host : 'localhost',
  password : 'MY_REDIS_PWD'
};


// stats服务器的配置
exports.stats = {
  port : 6000,
  host : 'localhost'
};


// session的配置
exports.session = {
  secret : 'jenny&tree',
  key : 'vicanso',
  ttl : 3600 * 12
};


// mongodb服务器的连接uri
exports.mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:10020/stats';