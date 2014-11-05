path = require 'path'
config = require './config'
moment = require 'moment'
express = require 'express'
fs = require 'fs'
crypto = require 'crypto'
_ = require 'underscore'
JTCluster = require 'jtcluster'

JTStats = require './helpers/stats'
logger = require('./helpers/logger') __filename
fileHash = require './helpers/hash'

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

  app.locals.convertImgSrc = (src) ->
    newSrc = config.staticUrlPrefix + src
    if config.env == 'development'
      newSrc
    else
      file = path.join config.staticPath, src
      key = fileHash.createSync file
      "#{newSrc}?v=#{key}"
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

    JTStats.gauge "handlingReqTotal.#{config.nodeName}", handlingReqTotal
      
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
    JTStats.gauge "memory.rss.#{config.nodeName}", rss
    JTStats.gauge "memory.heapTotal.#{config.nodeName}", heapTotal
    JTStats.gauge "memory.heapUsed.#{config.nodeName}", heapUsed
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
      JTStats.average "lag.#{config.nodeName}", lag
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
  app.get '/jt/restart', (req, res) ->
    key = req.query?.key
    if key
      shasum = crypto.createHash 'sha1'
      if '6a3f4389a53c889b623e67f385f28ab8e84e5029' == shasum.update(key).digest 'hex'
        res.header 'Cache-Control', 'no-cache, no-store'
        res.status(200).json {msg : 'success'}
        setTimeout ->
          JTCluster.restartAll();
        , 1000
      else
        res.status(500).json {msg : 'fail, the key is wrong'}
    else
      res.status(500).json {msg : 'fail, the key is null'}
  appVersion = ''
  fs.readFile path.join(__dirname, 'version'), (err, buf) ->
    appVersion = buf.toString() if buf
    return
  app.get '/jt/version', (req, res) ->
    codeVersion = fs.readFileSync path.join(__dirname, 'version')
    res.send {
      running : appVersion
      version : codeVersion?.toString()
    }


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
      app.use mount, jtDev.stylus.parser staticPath, {linenos : true}
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
  
  app = express()
  initAppSetting app
  app.use '/ping', (req, res) ->
    res.send 'success'
    return

    
  if config.env != 'development'
    initMonitor()
    
    hostName = require('os').hostname()
    app.use (req, res, next) ->
      res.header 'JT-Info', "#{hostName},#{process.pid},#{config.nodeName}"
      next()
    
    app.use requestStatistics() 
    httpLogger = require('./helpers/logger') 'HTTP'
    app.use require('morgan') 'tiny', {
      stream : 
        write : (msg) ->
          httpLogger.info msg.trim()
    }

  timeout = require 'connect-timeout'
  app.use timeout 60 * 1000


  staticHandler app, '/static', config.staticPath

  

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

process.on 'exit', (code) ->
  logger.error "process #{config.nodeName} exit with code:#{code}"


# console.dir process.disconnect()

if config.env == 'development'
  initServer()
else
  new JTCluster {
    handler : initServer
    envs : [
      {
        jtProcessName : 'tg'
      }
      {
        jtProcessName : 'cf'
      }
    ]
    error : (args...) ->
      logger.error.apply logger, args
    log : (args...) ->
      logger.log.apply logger, args
  }
