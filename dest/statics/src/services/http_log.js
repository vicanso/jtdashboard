
/**
 * $http相关的数据记录（请求使用时间，出错等）
 */

(function() {
  var module, now;

  module = angular.module('jt.httpLog', ['LocalStorageModule']);

  now = Date.now || function() {
    return new Date().getTime();
  };

  module.factory('jtHttpLog', [
    '$q', '$injector', 'localStorageService', function($q, $injector, localStorageService) {
      var httpLog, httpLogStorage, postHttpLog;
      httpLogStorage = localStorageService.get('httpLog') || {
        success: [],
        error: []
      };

      /**
       * [postHttpLog 向服务器发送http log的数据]
       * @return {[type]} [description]
       */
      postHttpLog = function() {
        var $http;
        $http = $injector.get('$http');
        if (httpLogStorage.success.length || httpLogStorage.error.length) {
          $http.post('/httplog', httpLogStorage).success(function(res) {
            return console.dir(res);
          }).error(function(res) {
            return console.dir(res);
          });
          httpLogStorage = {
            success: [],
            error: []
          };
          return localStorageService.set('httpLog', httpLogStorage);
        }
      };
      setInterval(function() {
        return postHttpLog();
      }, 120 * 1000);
      httpLog = {
        request: function(config) {
          config._createdAt = now();
          return config;
        },
        response: function(res) {
          var config, url, useTime;
          config = res.config;
          url = config.url;
          if (url !== '/httplog') {
            useTime = now() - config._createdAt;
            httpLogStorage.success.push({
              url: url,
              use: useTime
            });
            localStorageService.set('httpLog', httpLogStorage);
          }
          return res;
        },
        requestError: function(rejection) {
          return $q.reject(rejection);
        },
        responseError: function(rejection) {
          httpLogStorage.error.push({
            url: rejection.config.url,
            status: rejection.status
          });
          localStorageService.set('httpLog', httpLogStorage);
          return $q.reject(rejection);
        }
      };
      return httpLog;
    }
  ]);

}).call(this);
