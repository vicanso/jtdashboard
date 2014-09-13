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
  # template = res.locals.TEMPLATE
  # if template && components
  #   currentTemplateComponents = components[template]
  #   fileImporter.importJs currentTemplateComponents?.js
  #   fileImporter.importCss currentTemplateComponents?.css

  fileImporter.version crc32Config if crc32Config
  fileImporter.prefix config.staticUrlPrefix
  res.locals.fileImporter = fileImporter
  next()

routeInfos = [
  {
    route : '/import/files'
    type : 'post'
    handler : controllers.import_files
  }
  {
    route : '/timeline'
    type : 'post'
    handler : controllers.timeline
  }
  {
    route : '/httplog'
    type : 'post'
    handler : controllers.http_log
  }
  {
    route : ['/', '/dashboard']
    handler : controllers.dashboard
    middleware : [addImporter]
    template : 'dashboard'
  }
  {
    route : '/add'
    handler : controllers.add
    middleware : [addImporter]
    template : 'add'
  }
  {
    route : '/user'
    handler : controllers.user
  }
  # 获取collection中的所有key
  {
    route : '/collection/:collection/keys'
    handler : controllers.collection.getKeys
  }
  # 根据参数获取统计数据
  {
    route : '/stats'
    handler : controllers.stats
  }
]






module.exports.init = (app) ->
  router.init app, routeInfos