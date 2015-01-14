'use strict';
var _ = require('lodash');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var config = require('../config');
var componentsFile = path.join(__dirname, '../components.json');


/**
 * [logComponents 记录该template使用到的静态文件]
 * @param  {[type]} template [description]
 * @param  {[type]} importer [description]
 * @return {[type]}          [description]
 */
var logComponents = function(template, importer){

  var components = {};
  if(fs.existsSync(componentsFile)){
    components = JSON.parse(fs.readFileSync(componentsFile, 'utf8') || '{}');
  }
  var data = components[template] || {};
  var isRejected = function(fileUrl){
    return fileUrl.substring(0, 7) === 'http://' || fileUrl.substring(0, 8) === 'https://' || fileUrl.substring(0, 2) === '//';
  };
  var isDifference = function(arr1, arr2){
    var str1 = '';
    var str2 = '';
    if(arr1){
      str1 = arr1.join('');
    }
    if(arr2){
      str2 = arr2.join('');
    }
    return str1 !== str2;
  };

  var jsFiles = _.filter(importer.getFiles('js'), function(file){
    return !isRejected(file);
  });
  var cssFiles = _.filter(importer.getFiles('css'), function(file){
    return !isRejected(file);
  });
  if(isDifference(data.js, jsFiles) || isDifference(data.css, cssFiles)){
    data.css = cssFiles;
    data.js = jsFiles;
    data.modifiedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    components[template] = data;
    fs.writeFileSync(componentsFile, JSON.stringify(components, null, 2));
  }
  
};

/**
 * [render render html]
 * @param  {[type]}   res      [description]
 * @param  {[type]}   template [description]
 * @param  {[type]}   data     [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var render = function(res, template, data, next){
  var importer = data.importer || res.locals.importer;
  res.render(template, data, function(err, html){
    if(err){
      next(err);
      return;
    }
    if(importer){
      html = appendJsAndCss(html, importer);
      if(config.env === 'development'){
        logComponents(template, importer);
      }
    }
    response(res, html, next);
  });
};

var response = function(res, data, next){
  res.send(data);
};

var json = function(res, data, next){
  res.json(data);
};


/**
 * [appendJsAndCss 插入静态文件列表]
 * @param  {[type]} html     [description]
 * @param  {[type]} importer [description]
 * @return {[type]}          [description]
 */
var appendJsAndCss = function(html, importer){
  html = html.replace('<!--CSS_FILES_CONTAINER-->', importer.exportCss());
  html = html.replace('<!--JS_FILES_CONTAINER-->', importer.exportJs());
  return html;
};


/**
 * [routerHandler 路由处理，判断如果有template，则render html，如果不是，返回的数据是object，则以json的形式返回，都不是直接send]
 * @param  {[type]} handler  [description]
 * @param  {[type]} template [description]
 * @return {[type]}          [description]
 */
var routerHandler = function(handler, template){
  return function(req, res, next){
    next = _.once(next);
    var cbf = function(err, data){
      if(err){
        next(err);
        return;
      }
      if(res.headersSent){
        err = new Error('the header has been sent');
        err.msg = '该请求已经发送';
        console.error(err);
        return;
      }
      if(data){
        if(template){
          res.locals.TEMPLATE = template;
          render(res, template, data, next);
        }else{
          if(_.isObject(data)){
            json(res, data, next);
          }else{
            response(res, data, next);
          }
        }
      }else{
        res.send('');
      }
    };
    handler(req, res, cbf);
  };
};


/**
 * [init 根据路由的配置信息，生成处理方法]
 * @param  {[type]} router     [description]
 * @param  {[type]} routeInfos [description]
 * @return {[type]}            [description]
 */
exports.init = function(router, routeInfos){
  _.forEach(routeInfos, function(routeInfo){
    var template = routeInfo.template;
    var middleware = routeInfo.middleware || [];
    var routes = routeInfo.route;
    if(!_.isArray(routes)){
      routes = [routes];
    }
    var methods = routeInfo.method || 'get';
    if(!_.isArray(methods)){
      methods = [methods];
    }
    var handler = routeInfo.handler;
    if(!handler){
      console.error('handler is undefined, ' + JSON.stringify(routeInfo));
      return;
    }
    if(handler.length === 3){
      handler = routerHandler(handler, template);
    }
    _.forEach(routes, function(route){
      _.forEach(methods, function(method){
        method = method.toLowerCase();
        router[method](route, middleware, handler);
      });
    });
  });
};