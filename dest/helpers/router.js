(function() {
  var appendJsAndCss, jsonResponse, renderResponse, resIsAvailable, response, _;

  _ = require('underscore');


  /**
   * init 初始化路由处理
   * @param  {express对象} app   express的实例
   * @param  {Array} routeInfos  路由配置的信息列表
   * @return {[type]}  [description]
   */

  module.exports.init = function(app, routeInfos) {
    return _.each(routeInfos, function(routeInfo) {
      var addLocals, handle, middleware, routes, template;
      template = routeInfo.template;
      handle = function(req, res, next) {
        var cbf;
        next = _.once(next);
        cbf = function(err, data) {
          if (err) {
            next(err);
            return;
          }
          if (data) {
            if (template) {
              return renderResponse(req, res, template, data, next);
            } else {
              if (_.isObject(data)) {
                return jsonResponse(req, res, data, next);
              } else {
                return response(req, res, data, next);
              }
            }
          } else {
            return res.send('');
          }
        };
        return routeInfo.handler(req, res, cbf, next);
      };
      middleware = routeInfo.middleware || [];
      addLocals = function(req, res, next) {
        if (template) {
          res.locals.TEMPLATE = template;
        }
        return next();
      };
      middleware.unshift(addLocals);
      routes = routeInfo.route;
      if (!_.isArray(routes)) {
        routes = [routes];
      }
      return _.each(routes, function(route) {
        var types;
        types = routeInfo.type || 'get';
        if (!_.isArray(types)) {
          types = [types];
        }
        return _.each(types, function(type) {
          var method;
          method = type.toLowerCase();
          return app[method](route, middleware, handle);
        });
      });
    });
  };


  /**
   * renderResponse render模板
   * @param  {[type]}   req           [description]
   * @param  {[type]}   res           [description]
   * @param  {[type]}   template      [description]
   * @param  {[type]}   data          [description]
   * @param  {Function} next          [description]
   * @return {[type]}                 [description]
   */

  renderResponse = module.exports.render = function(req, res, template, data, next) {
    var fileImporter, _ref;
    fileImporter = data.fileImporter || ((_ref = res.locals) != null ? _ref.fileImporter : void 0);
    return res.render(template, data, (function(_this) {
      return function(err, html) {
        if (err) {
          next(err);
          return;
        }
        if (fileImporter) {
          html = appendJsAndCss(html, fileImporter);
        }
        res.header('Content-Type', 'text/html');
        return response(req, res, html, next);
      };
    })(this));
  };


  /**
   * response 响应请求
   * @param  {request} req request
   * @param  {response} res response
   * @param  {Object, String, Buffer} data 响应的数据
   * @return {[type]}               [description]
   */

  response = function(req, res, data, next) {
    var err;
    if (resIsAvailable(res)) {
      return res.send(data);
    } else {
      err = new Error('the header has been sent!');
      err.msg = '该请求已发送';
      return next(err);
    }
  };


  /**
   * jsonResponse 响应json
   * @param  {[type]}   req           [description]
   * @param  {[type]}   res           [description]
   * @param  {[type]}   data          [description]
   * @param  {Function} next          [description]
   * @return {[type]}                 [description]
   */

  jsonResponse = function(req, res, data, next) {
    var err, keys, _ref;
    if (resIsAvailable(res)) {
      res.header('Content-Type', 'application/json');
      keys = (_ref = req.query) != null ? _ref._key : void 0;
      if (keys) {
        keys = keys.split(',');
        if (_.isArray(data)) {
          data = _.map(data, function(item) {
            return _.pick(item, keys);
          });
        } else {
          data = _.pick(data, keys);
        }
      }
      return res.json(data);
    } else {
      err = new Error('the header has been sent!');
      err.msg = '该请求已发送';
      return next(err);
    }
  };


  /**
   * appendJsAndCss 往HTML中插入js,css引入列表
   * @param  {String} html html内容（未包含通过FileImporter引入的js,css）
   * @param  {FileImporter} fileImporter FileImporter实例
   * @return {String} 已添加js,css的html
   */

  appendJsAndCss = function(html, fileImporter) {
    var isProductionMode;
    isProductionMode = process.env.NODE_ENV === 'production';
    html = html.replace('<!--CSS_FILES_CONTAINER-->', fileImporter.exportCss(isProductionMode));
    html = html.replace('<!--JS_FILES_CONTAINER-->', fileImporter.exportJs(isProductionMode));
    return html;
  };


  /**
     * resIsAvailable 判断response是否可用
     * @param  {response} res response对象
     * @return {Boolean}
   */

  resIsAvailable = function(res) {
    return !res.headersSent;
  };

}).call(this);
