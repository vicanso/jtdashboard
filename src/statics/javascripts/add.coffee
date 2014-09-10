module = angular.module 'jt.addPage', []

module.factory 'stats', ['$http', ($http) ->

  stats = 
    getKeys : (category, cbf) ->
      $http.get("/collection/#{category}/keys").success((res)->
        cbf null, res
      ).error (res) ->
        cbf res
  stats
]

fn = ($scope, $http, debug, $log, utils, user, stats) ->
  debug = debug 'jt.addPage'

  $scope.config = 
    stats : [{}]
  $scope.error = {}

  $scope.intervalList = '1分钟 5分钟 10分钟 30分钟 1小时 2小时 6小时 12小时 1天'.split ' '
  intervalConvertInfos = 
    '1分钟' : 60
    '5分钟' : 300
    '10分钟' : 600
    '30分钟' : 1800
    '1小时' : 3600
    '2小时' : 7200
    '6小时' : 21600
    '12小时' : 43200
    '1天' : 86400

  $scope.dateList = '当天 7天 15天 30天 当月'.split ' '
  dateRangeConfigs = 
    '当天' : [0, 0]
    '7天' : [-6, 0]
    '15天' : [-14, 0]
    '30天' : [-29, 0]
    '当月' : ['currentMonth', 0]

  $scope.categoryList = JT_GLOBAL.collections
  $scope.keys = {}



  getKeys = utils.memoize stats.getKeys



  $scope.selectChartType = (type) ->
    $scope.config.chartType = type


  $scope.save = ->
    config = $scope.config
    msgList = []
    msgList.push '请选择时间间隔' if !config.interval

    msgList.push '请选择开始日期' if !config.startDate && config.startDate != 0

    msgList.push '请选择结束日期' if !config.endDate && config.endDate != 0

    if msgList.length
      $scope.error.save = msgList.join ','
      return
    data =
      interval : intervalConvertInfos[config.interval]
      start : config.startDate
      end : config.endDate

    console.dir data

  $scope.$watch 'config.stats', (newValues, oldValues) ->
    angular.forEach newValues, (newValue, i) ->
      oldValue = oldValues[i]
      category = newValue.category
      # 判断该category对应的key是否有获取
      if category != oldValue.category && !$scope.keys[category]
        getKeys category, (err, keys) ->
          if keys
            $scope.keys[category] = keys
            console.dir $scope.keys[category]

  , true

  $scope.$watch 'config.date', (v)->
    dateRange = dateRangeConfigs[v]
    if dateRange
      $scope.config.startDate = dateRange[0]
      $scope.config.endDate = dateRange[1]


  # stats.getKeys 'haproxy', (err, keys) ->
  #   console.dir keys
  # stats.getKeys 'haproxy', (err, keys) ->
  #   console.dir keys

fn.$inject = ['$scope', '$http', 'debug', '$log', 'utils', 'user', 'stats']

JT_APP.addRequires ['jt.addPage']
JT_APP.controller 'AddPageController', fn



