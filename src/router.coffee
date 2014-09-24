router = require './helpers/router'
config = require './config'
requireTree = require 'require-tree'
controllers = requireTree './controllers'
FileImporter = require 'jtfileimporter'
JTMerger = require 'jtmerger'
if config.env != 'development'
  crc32Config = require './crc32.json'
  merger = new JTMerger require './merge.json'



addImporter = (req, res, next) ->
  fileImporter = new FileImporter merger
  fileImporter.debug true if res.locals.DEBUG
  fileImporter.hosts config.staticHosts

  fileImporter.version crc32Config if crc32Config
  fileImporter.prefix config.staticUrlPrefix
  res.locals.fileImporter = fileImporter
  next()
###*
 * [setNoCache 所有不可以缓存的GET请求，都应带上cache=false，方便haproxy判断该请求是否可以进入varnish]
 * @param {[type]}   req  [description]
 * @param {[type]}   res  [description]
 * @param {Function} next [description]
###
setNoCache = (req, res, next) ->
  query = req.query
  if req.method == 'GET' && query.cache != 'false'
    query.cache = false
    querystring = require 'querystring'
    url = require 'url'
    urlInfo = url.parse req.url
    res.redirect 301, "#{urlInfo.pathname}?#{querystring.stringify(query)}"
  else
    res.header 'Cache-Control', 'no-cache, no-store'
    next()

getCacheController = (ttl) ->
  (req, res, next) ->
    if config.env == 'development'
      res.header 'Cache-Control', 'no-cache, no-store'
    else
      res.header 'Cache-Control', "public, max-age=#{ttl}"
    next()
routeInfos = [
  {
    route : '/import/files'
    type : 'post'
    middleware : [setNoCache]
    handler : controllers.import_files
  }
  {
    route : '/timeline'
    type : 'post'
    middleware : [setNoCache]
    handler : controllers.timeline
  }
  {
    route : '/httplog'
    type : 'post'
    middleware : [setNoCache]
    handler : controllers.http_log
  }
  {
    route : ['/', '/dashboard']
    handler : controllers.dashboard
    middleware : [
      getCacheController 600
      addImporter
    ]
    template : 'dashboard'
  }
  {
    route : '/add'
    handler : controllers.add
    middleware : [
      getCacheController 600
      addImporter
    ]
    template : 'add'
  }
  {
    route : '/configs'
    handler : controllers.configs
    middleware : [addImporter]
    template : 'configs'
  }
  {
    route : '/user'
    middleware : [setNoCache]
    handler : controllers.user
  }
  # 获取collection中的所有key
  {
    route : '/collection/:collection/keys'
    middleware : [
      getCacheController 600
    ]
    handler : controllers.collection.getKeys
  }
  # 根据参数获取统计数据
  {
    route : '/stats'
    handler : controllers.stats
  }
  {
    route : '/config'
    type : 'post'
    middleware : [setNoCache]
    handler : controllers.config
  }
  {
    route : '/config'
    type : 'get'
    middleware : [
      getCacheController 600
    ]
    handler : controllers.config
  }
  {
    route : '/set'
    type : 'post'
    middleware : [setNoCache]
    handler : controllers.set
  }
  {
    route : '/set/:id'
    middleware : [
      getCacheController 600
    ]
    handler : controllers.set
  }
]






module.exports.init = (app) ->
  router.init app, routeInfos