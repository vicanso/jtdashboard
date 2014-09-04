path = require 'path'
config = require './config'
moment = require 'moment'
express = require 'express'
_ = require 'underscore'
JTStats = require './helpers/stats'
logger = require('./helpers/logger') __filename

###*
 * [initAppSetting 初始化app的配置]
 * @param  {[type]} app [description]
 * @return {[type]}     [description]
###
initAppSetting = (app) ->
  app.set 'view engine', 'jade'
  app.set 'trust proxy', true
  app.set 'views', "#{__dirname}/views"

  app.locals.ENV = config.env
  app.locals.STATIC_URL_PREFIX = config.staticUrlPrefix
  return

###*
 * [initMongod 初始化mongodb]
 * @return {[type]} [description]
###
initMongod = ->
  uri = config.mongodbUri
  if uri
    mongodb = require './helpers/mongodb'
    mongodb.init uri
    mongodb.initModels path.join __dirname, './models'

###*
 * [requestStatistics 请求统计]
 * @return {[type]} [description]
###
requestStatistics = ->
  handlingReqTotal = 0
  (req, res, next) ->
    startAt = process.hrtime()
    handlingReqTotal++

    JTStats.gauge "handlingReqTotal.#{process._jtPid || 0}", handlingReqTotal
      
    stat = _.once ->
      diff = process.hrtime startAt
      ms = diff[0] * 1e3 + diff[1] * 1e-6
      handlingReqTotal--
      data = 
        responeseTime : ms.toFixed(3)
        statusCode : res.statusCode
        url : req.url
        handlingReqTotal : handlingReqTotal
        contentLength : GLOBAL.parseInt res.get 'Content-Length'
      logger.info data

    res.on 'finish', stat
    res.on 'close', stat
    next()


###*
 * [initMonitor 初始化监控]
 * @return {[type]} [description]
###
initMonitor = ->
  MB = 1024 * 1024
  memoryLog = ->
    memoryUsage = process.memoryUsage()
    rss = Math.floor memoryUsage.rss / MB
    heapTotal = Math.floor memoryUsage.heapTotal / MB
    heapUsed = Math.floor memoryUsage.heapUsed / MB
    JTStats.gauge "memory.rss.#{process._jtPid || 0}", rss
    JTStats.gauge "memory.heapTotal.#{process._jtPid || 0}", heapTotal
    JTStats.gauge "memory.heapUsed.#{process._jtPid || 0}", heapUsed
    setTimeout memoryLog, 10 * 1000
  

  lagTotal = 0
  lagCount = 0
  toobusy = require 'toobusy'
  lagLog = ->
    lagTotal += toobusy.lag()
    lagCount++
    if lagCount == 10
      lag = Math.ceil lagTotal / lagCount
      lagCount = 0
      lagTotal = 0
      JTStats.average "lag.#{process._jtPid || 0}", lag
    setTimeout lagLog, 1000

  lagLog()
  memoryLog()

debugParamsHandler = ->
  (req, res, next) ->
    res.locals.DEBUG = req.param('__debug')
    pattern = req.param '__pattern'
    pattern = '*' if config.env == 'development' && !pattern
    res.locals.PATTERN = pattern
    next()

###*
 * [adminHandler description]
 * @param  {[type]} app [description]
 * @return {[type]}     [description]
###
adminHandler = (app) ->
  crypto = require 'crypto'
  app.get '/jt/restart', (req, res) ->
    key = req.query?.key
    if key
      shasum = crypto.createHash 'sha1'
      if '6a3f4389a53c889b623e67f385f28ab8e84e5029' == shasum.update(key).digest 'hex'
        res.status(200).json {msg : 'success'}
        jtCluster?.restartAll()
      else
        res.status(500).json {msg : 'fail, the key is wrong'}
    else
      res.status(500).json {msg : 'fail, the key is null'}


staticHandler = do ->
  expressStatic = 'static'
  serveStatic = express[expressStatic]
  ###*
   * [staticHandler 静态文件处理]
   * @param  {[type]} app      [description]
   * @param  {[type]} mount      [description]
   * @param  {[type]} staticPath [description]
   * @return {[type]}            [description]
  ###
  (app, mount, staticPath) ->
    handler = serveStatic staticPath
    
    hour = 3600
    hourTotal = 30 * 24
    expires = moment().add(moment.duration hourTotal, 'hour').toString()
    if !process.env.NODE_ENV
      hour = 0
      expires = ''

    staticMaxAge = hourTotal * hour

    if config.env == 'development'
      jtDev = require 'jtdev'
      app.use mount, jtDev.ext.converter staticPath
      app.use mount, jtDev.stylus.parser staticPath
      app.use mount, jtDev.coffee.parser staticPath
    app.use mount, (req, res, next) ->
      res.header 'Expires', expires if expires
      res.header 'Cache-Control', "public, max-age=#{staticMaxAge}, s-maxage=#{hour}"
      handler req, res, (err) ->
        return next err if err
        logger.error "#{req.url} is not found!"
        res.status(404).send ''


initServer = ->
  initMongod()
  initMonitor()
  app = express()
  initAppSetting app

  app.use '/healthchecks', (req, res) ->
    res.send 'success'

    
  if config.env != 'development'
    hostName = require('os').hostname()
    app.use (req, res, next) ->
      res.header 'JT-Info', "#{hostName},#{process.pid},#{process._jtPid}"
      next()
    
    app.use requestStatistics() 
    httpLogger = require('./helpers/logger') 'HTTP'
    app.use require('morgan') 'tiny', {
      stream : 
        write : (msg) ->
          httpLogger.info msg.trim()
    }

  timeout = require 'connect-timeout'
  app.use timeout 5000


  staticHandler app, '/static', path.join "#{__dirname}/statics"

  

  app.use require('method-override')()
  bodyParser = require 'body-parser'
  app.use bodyParser.urlencoded {
    extended : false
  }
  app.use bodyParser.json()

  app.use debugParamsHandler()

  adminHandler app

  require('./router').init app

  app.use require './controllers/error'

  app.listen config.port

  logger.info "server listen on: #{config.port}"

if config.env == 'development'
  initServer()
else
  JTCluster = require 'jtcluster'
  options = 
    slaveTotal : 2
    slaveHandler : initServer
  jtCluster = new JTCluster options
  jtCluster.on 'log', (msg) ->
    logger.info msg


