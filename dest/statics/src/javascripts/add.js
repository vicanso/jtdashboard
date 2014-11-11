(function() {
  var fn, module;

  module = angular.module('jt.addPage', []);

  module.factory('jtStatsConfig', [
    '$http', 'jtDebug', function($http, jtDebug) {
      var dateRangeConfigs, debug, intervalConvertInfos, stats;
      debug = jtDebug('jt.jtStatsConfig');
      intervalConvertInfos = {
        '最近': -1,
        '10秒': 10,
        '1分钟': 60,
        '5分钟': 300,
        '10分钟': 600,
        '30分钟': 1800,
        '1小时': 3600,
        '2小时': 7200,
        '6小时': 21600,
        '12小时': 43200,
        '1天': 86400
      };
      dateRangeConfigs = {
        '当天': [0, 0],
        '7天': [-6, 0],
        '15天': [-14, 0],
        '30天': [-29, 0],
        '当月': ['currentMonth', 0]
      };
      stats = {
        getKeys: function(category, cbf) {
          return $http.get("/collection/" + category + "/keys").success(function(res) {
            debug('getKeys res:%j', res);
            return cbf(null, res);
          }).error(function(err) {
            debug('getKeys err:%j', err);
            return cbf(err);
          });
        },
        getIntervalList: function() {
          return '最近 10秒 1分钟 5分钟 10分钟 30分钟 1小时 2小时 6小时 12小时 1天'.split(' ');
        },
        convertInterval: function(interval) {
          return intervalConvertInfos[interval];
        },
        getIntervalName: function(interval) {
          var name;
          name = '';
          angular.forEach(intervalConvertInfos, function(v, k) {
            if (interval === v) {
              name = k;
            }
          });
          return name;
        },
        getDateList: function() {
          return '当天 7天 15天 30天 当月'.split(' ');
        },
        getDateRange: function(v) {
          return dateRangeConfigs[v];
        },
        getChartTypes: function() {
          return JT_GLOBAL.chartTypes;
        }
      };
      return stats;
    }
  ]);

  fn = function($scope, $http, $element, $timeout, jtDebug, $log, jtUtils, user, jtStatsConfig) {
    var debug, getKeys, getStatsOptions;
    debug = jtDebug('jt.addPage');
    $scope.intervalList = jtStatsConfig.getIntervalList();
    $scope.chartTypes = jtStatsConfig.getChartTypes();
    $scope.config = {
      stats: [
        {
          chart: 'line'
        }
      ],
      chartType: $scope.chartTypes[0].type
    };
    $timeout(function() {
      var keysList, tmpStats;
      if (!JT_GLOBAL.config) {
        return;
      }
      tmpStats = [];
      keysList = [];
      angular.forEach(JT_GLOBAL.config.stats, function(statConfig) {
        var keys;
        keys = {};
        angular.forEach(statConfig.keys, function(keyInfo) {
          keys[keyInfo.value] = true;
        });
        tmpStats.push({
          category: statConfig.category,
          chart: statConfig.chart
        });
        keysList.push(keys);
      });
      $scope.config = {
        name: JT_GLOBAL.config.name,
        desc: JT_GLOBAL.config.desc,
        stats: tmpStats,
        interval: jtStatsConfig.getIntervalName(JT_GLOBAL.config.point.interval),
        startDate: JT_GLOBAL.config.date.start,
        endDate: JT_GLOBAL.config.date.end,
        chartType: JT_GLOBAL.config.type,
        refreshInterval: JT_GLOBAL.config.refreshInterval
      };
      $timeout(function() {
        return angular.forEach($scope.config.stats, function(statsConfig, i) {
          statsConfig.keys = keysList[i];
        });
      }, 100);
    }, 100);
    $scope.error = {};
    $scope.success = {};
    $scope.dateList = jtStatsConfig.getDateList();
    $scope.categoryList = JT_GLOBAL.collections;
    $scope.keys = {};
    getKeys = jtUtils.memoize(jtStatsConfig.getKeys);
    getStatsOptions = function() {
      var config, msgList, options, refreshInterval;
      config = $scope.config;
      msgList = [];
      if (!config.interval) {
        msgList.push('请选择时间间隔');
      }
      if (!config.startDate && config.startDate !== 0) {
        msgList.push('请选择开始日期');
      }
      if (!config.endDate && config.endDate !== 0) {
        msgList.push('请选择结束日期');
      }
      if (msgList.length) {
        $scope.error.save = msgList.join(',');
        return;
      }
      refreshInterval = config.refreshInterval;
      options = {
        name: config.name,
        desc: config.desc,
        type: config.chartType,
        point: {
          interval: jtStatsConfig.convertInterval(config.interval)
        },
        date: {
          start: config.startDate,
          end: config.endDate
        },
        refreshInterval: refreshInterval,
        stats: []
      };
      angular.forEach(config.stats, function(tmp) {
        var statConfig;
        statConfig = {
          chart: tmp.chart,
          category: tmp.category,
          keys: []
        };
        angular.forEach(tmp.keys, function(v, k) {
          if (v) {
            return statConfig.keys.push({
              value: k
            });
          }
        });
        if (tmp.regKey) {
          statConfig.keys.push({
            value: tmp.regKey,
            type: 'reg'
          });
        }
        return options.stats.push(statConfig);
      });
      debug("options:%j", options);
      return options;
    };
    $scope.selectChartType = function(type) {
      $scope.config.chartType = type;
    };
    $scope.addParamSelector = function() {
      $scope.config.stats.push({
        chart: $scope.config.chartType
      });
    };
    $scope.deleteParamSelector = function(index) {
      $scope.config.stats.splice(index, 1);
    };
    $scope.preview = function() {
      var options;
      $scope.error.save = '';
      options = getStatsOptions();
      $scope.statsOptions = options;
    };
    $scope.save = function() {
      var errMsgs, error, options, success, url;
      $scope.error.save = '';
      options = getStatsOptions();
      errMsgs = [];
      if (!options.name) {
        errMsgs.push('统计名称不能为空');
      }
      if (!options.desc) {
        errMsgs.push('统计描述不能为空');
      }
      if (errMsgs.length) {
        $scope.error.save = errMsgs.join(',');
        return;
      }
      success = function(res, status) {
        $scope.success.save = '已成功保存配置，3秒后刷新页面';
        $timeout(function() {
          return window.location.reload();
        }, 3000);
      };
      error = function(err, status) {
        $scope.error.save = '保存配置失败，' + err.msg;
      };
      url = '/config';
      if (JT_GLOBAL.config) {
        url += "/" + JT_GLOBAL.config._id;
      }
      $http.post(url, options).success(success).error(error);
    };
    $scope.$watch('config.stats', function(newValues, oldValues) {
      return angular.forEach(newValues, function(newValue, i) {
        var category, oldValue;
        oldValue = oldValues[i];
        category = newValue.category;
        if (category && category !== (oldValue != null ? oldValue.category : void 0)) {
          if (!$scope.keys[category]) {
            getKeys(category, function(err, keys) {
              if (keys) {
                $scope.keys[category] = keys;
              }
            });
          }
        }
      });
    }, true);
    $scope.$watch('config.chartType', function(v) {
      var defaultType, typeMap;
      typeMap = {
        'line': 'line stack'.split(' '),
        'bar': 'barVertical barHorizontal stackBarVertical stackBarHorizontal'.split(' '),
        'pie': 'pie nestedPie'
      };
      defaultType = 'none';
      angular.forEach(typeMap, function(charts, type) {
        if (~charts.indexOf(v)) {
          defaultType = type;
        }
      });
      angular.forEach($scope.config.stats, function(stat) {
        stat.chart = defaultType;
      });
      if (defaultType === 'pie') {
        $scope.chartTypeStatusDict = {
          line: false,
          bar: false,
          pie: true
        };
      } else if (defaultType === 'line' || defaultType === 'bar') {
        $scope.chartTypeStatusDict = {
          line: true,
          bar: true,
          pie: false
        };
      } else {
        $scope.chartTypeStatusDict = {
          line: false,
          bar: false,
          pie: false
        };
      }
    });
    $scope.$watch('config.date', function(v) {
      var dateRange;
      dateRange = jtStatsConfig.getDateRange(v);
      if (dateRange) {
        $scope.config.startDate = dateRange[0];
        $scope.config.endDate = dateRange[1];
      }
    });
    $element.removeClass('hidden');
  };

  fn.$inject = ['$scope', '$http', '$element', '$timeout', 'jtDebug', '$log', 'jtUtils', 'user', 'jtStatsConfig'];

  angular.module('jtApp').addRequires(['jt.addPage']).controller('AddPageController', fn);

}).call(this);
