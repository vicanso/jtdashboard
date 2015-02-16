/*!
 * 记录发送ajax请求的响应时间和状态码等
 * @return {[type]} [description]
 */
;(function(){
'use strict';
var module = angular.module('jt.service.httpLog', ['LocalStorageModule']);
var now = Date.now || function(){
  return new Date().getTime();
};

module.factory('httpLog', ['$q', '$injector', 'localStorageService', function($q, $injector, localStorageService){
  // 本地存储http log，定时将所有的log往服务器发送
  var httpLogStorage = localStorageService.get('httpLog') || {
    success : [],
    error : []
  };
  var successLog = httpLogStorage.success;
  var errorLog = httpLogStorage.error;
  var postInterval = 120 * 1000;
  var postUrl = '/httplog';

  var post = function(){
    var $http = $injector.get('$http');

    if(successLog.length || errorLog.length){
      $http.post(postUrl, httpLogStorage).success(function(res){
        successLog.length = 0;
        errorLog.length = 0;
        save();
        setTimeout(post, postInterval);
      }).error(function(res){
        setTimeout(post, postInterval);
      });
    }
  };

  var save = function(){
    localStorageService.set('httpLog', httpLogStorage);
  };

  var alertDeprecate = function(headers){
    var deprecate = headers('JT-Deprecate');
    if(deprecate && CONFIG.env === 'development'){
      alert('url:' + url + 'is deprecate, ' + deprecate);
    }
  };

  // 如果一开始log已经有20个，直接往后台post
  if(successLog.length + errorLog.length > 10){
    setTimeout(post, 1);
  }else{
    setTimeout(post, postInterval);
  }

  // 判断该请求是否忽略其统计
  var isIgnore = function(url){
    if(url === postUrl || url.indexOf('httplog=false') != -1){
      return true;
    }else{
      return false;
    }
  };

  var httpLog = {
    request : function(config){
      config._createdAt = now();
      return config;
    },
    response : function(res){
      var config = res.config;
      var url = config.url;
      alertDeprecate(res.headers);
      if(isIgnore(url)){
        return res;
      }
      var use = now() - config._createdAt;
      successLog.push({
        url : url,
        method : config.method,
        use : use
      });
      save();
      return res;
    },
    requestError : function(rejection){
      return $q.reject(rejection);
    },
    responseError : function(rejection){
      alertDeprecate(rejection.headers);
      var config = rejection.config;
      var url = config.url;
      if(isIgnore(url)){
        return $q.reject(rejection);
      }
      errorLog.push({
        url : url,
        status : rejection.status,
        use : now() - config._createdAt
      });
      save();
      return $q.reject(rejection);
    }
  };
  return httpLog;
}]);

})(this);