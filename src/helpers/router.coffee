_ = require 'underscore'
###*
 * init 初始化路由处理
 * @param  {express对象} app   express的实例
 * @param  {Array} routeInfos  路由配置的信息列表
 * @return {[type]}  [description]
###
module.exports.init = (app, routeInfos) ->
  _.each routeInfos, (routeInfo) ->
    template = routeInfo.template
    handle = (req, res, next) ->
      next = _.once next
      cbf = (err, data) ->
        if err
          next err
          return
        if data
          if template
            renderResponse req, res, template, data, next
          else
            if _.isObject data
              jsonResponse req, res, data, next
            else
              response req, res, data, next
        else
          res.send ''
      routeInfo.handler req, res, cbf, next
    middleware = routeInfo.middleware || []
    addLocals = (req, res, next) ->
      res.locals.TEMPLATE = template if template
      next()
    middleware.unshift addLocals
    routes = routeInfo.route
    if !_.isArray routes
      routes = [routes]
    _.each routes, (route) ->
      types = routeInfo.type || 'get'
      if !_.isArray types
        types = [types]
      _.each types, (type) ->
        method = type.toLowerCase()
        app[method] route, middleware, handle

###*
 * renderResponse render模板
 * @param  {[type]}   req           [description]
 * @param  {[type]}   res           [description]
 * @param  {[type]}   template      [description]
 * @param  {[type]}   data          [description]
 * @param  {Function} next          [description]
 * @return {[type]}                 [description]
###
renderResponse = module.exports.render = (req, res, template, data, next) ->
  fileImporter = data.fileImporter || res.locals?.fileImporter
  res.render template, data, (err, html) =>
    if err
      next err
      return 
    if fileImporter
      html = appendJsAndCss html, fileImporter
    res.header 'Content-Type', 'text/html'
    response req, res, html, next

###*
 * response 响应请求
 * @param  {request} req request
 * @param  {response} res response
 * @param  {Object, String, Buffer} data 响应的数据
 * @return {[type]}               [description]
###
response = (req, res, data, next) ->
  if resIsAvailable res
    res.send data
  else
    err = new Error 'the header has been sent!'
    err.msg = '该请求已发送' 
    next err
###*
 * jsonResponse 响应json
 * @param  {[type]}   req           [description]
 * @param  {[type]}   res           [description]
 * @param  {[type]}   data          [description]
 * @param  {Function} next          [description]
 * @return {[type]}                 [description]
###
jsonResponse = (req, res, data, next) ->
  if resIsAvailable res
    res.header 'Content-Type', 'application/json'
    keys = req.query?._key
    if keys
      keys = keys.split ','
      if _.isArray data
        data = _.map data, (item) ->
          _.pick item, keys
      else
        data = _.pick data, keys
    res.json data
  else
    err = new Error 'the header has been sent!'
    err.msg = '该请求已发送' 
    next err

###*
 * appendJsAndCss 往HTML中插入js,css引入列表
 * @param  {String} html html内容（未包含通过FileImporter引入的js,css）
 * @param  {FileImporter} fileImporter FileImporter实例
 * @return {String} 已添加js,css的html
###
appendJsAndCss = (html, fileImporter) ->
  isProductionMode = process.env.NODE_ENV == 'production'
  html = html.replace '<!--CSS_FILES_CONTAINER-->', fileImporter.exportCss isProductionMode
  html = html.replace '<!--JS_FILES_CONTAINER-->', fileImporter.exportJs isProductionMode
  html

###*
   * resIsAvailable 判断response是否可用
   * @param  {response} res response对象
   * @return {Boolean}
  ###
resIsAvailable = (res) ->
  !res.headersSent
