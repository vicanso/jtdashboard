(function() {
  var module;

  module = angular.module('jt.service.stats', ['jt.service.debug']);

  module.factory('jtStats', [
    '$http', '$q', 'jtDebug', function($http, $q, jtDebug) {
      var debug, jtStats;
      debug = jtDebug('jt.stats');
      jtStats = {

        /**
         * [getChartData description]
         * @param  {[type]} options 用于配置获取的数据参数
         * category： 对应于mongodb的collection
         * 
         * date：用于配置获取的时间段，可选，若为空则取当天数据
         * {
         *   start : '开始日期（YYYY-MM-DD）或者 -1, -2表示多少天之前'
         *   end : '结束日期（YYYY-MM-DD）'
         * }
         * 
         * key：用于标记获取的记录，有以下的配置方式
         * 1、{
         *   value : 'pv'
         *   type : 'reg' //可选，若为'reg'则是正式表达式配置，否则全配置
         * }
         * 2、[
         *   {
         *     value : 'pv'
         *   }
         *   {
         *     value : 'pv.category'
         *   }
         * ]
         *
         * point：用于配置点间隔
         * {
         *   interval : 60 // 60s，尽量使用和stats收集记录的配置时间的倍数，若不传该参数，后台获取数据默认以60s为间隔
         * }
         *
         * fill：是否填充未收集到数据的间隔，true or false，默认为false
         * @param  {[type]} cbf     [description]
         * @return {[type]}         [description]
         */
        getData: function(options, cbf) {
          var baseQuery, error, funcs, success;
          baseQuery = {
            date: options.date,
            fill: options.fill,
            point: options.point
          };
          funcs = [];
          angular.forEach(options.stats, function(statOptions) {
            var defer, httpOptions, url, _ref;
            defer = $q.defer();
            statOptions = angular.extend({}, baseQuery, statOptions);
            url = "/stats?conditions=" + (JSON.stringify(statOptions));
            httpOptions = {
              cache: true
            };
            if (((_ref = options.point) != null ? _ref.interval : void 0) < 0) {
              url += '&cache=false';
              httpOptions.cache = false;
            }
            if (options.refreshInterval) {
              httpOptions.cache = false;
            }
            $http.get(url, httpOptions).success(function(res) {
              if (angular.isArray(res)) {
                angular.forEach(res, function(item) {
                  item.chart = statOptions.chart;
                });
              } else {
                res.chart = statOptions.chart;
              }
              defer.resolve(res);
            }).error(function(res) {
              defer.reject(res);
            });
            funcs.push(defer.promise);
          });
          success = function(res) {
            var result;
            debug('getData options:%j, res:%j', options, res);
            result = [];
            angular.forEach(res, function(tmp) {
              if (angular.isArray(tmp)) {
                result = result.concat(tmp);
              } else {
                result.push(tmp);
              }
            });
            cbf(null, result);
          };
          error = function(err) {
            debug('getData options%j, err:%j', options, err);
            cbf(err);
          };
          return $q.all(funcs).then(success, error);
        },

        /**
         * [getKeys description]
         * @param  {[type]} category [description]
         * @param  {[type]} cbf      [description]
         * @return {[type]}          [description]
         */
        getKeys: function(category, cbf) {
          return $http.get("/collection/" + category + "/keys").success(function(res) {
            debug('getKeys res:%j', res);
            return cbf(null, res);
          }).error(function(err) {
            debug('getKeys err:%j', err);
            return cbf(err);
          });
        }
      };
      return jtStats;
    }
  ]);

}).call(this);
