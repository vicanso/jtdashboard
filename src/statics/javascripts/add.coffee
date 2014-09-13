module = angular.module 'jt.addPage', []

module.factory 'Stats', ['$http', ($http) ->

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

  dateRangeConfigs = 
    '当天' : [0, 0]
    '7天' : [-6, 0]
    '15天' : [-14, 0]
    '30天' : [-29, 0]
    '当月' : ['currentMonth', 0]

  stats = 
    getKeys : (category, cbf) ->
      $http.get("/collection/#{category}/keys").success((res)->
        cbf null, res
      ).error (res) ->
        cbf res
    getIntervalList : ->
      '1分钟 5分钟 10分钟 30分钟 1小时 2小时 6小时 12小时 1天'.split ' '
    convertInterval : (interval) ->
      intervalConvertInfos[interval]

    getDateList : ->
      '当天 7天 15天 30天 当月'.split ' '

    getDateRange : (v) ->
      dateRangeConfigs[v]

    getChartTypes : ->
      JT_GLOBAL.chartTypes
  stats
]

fn = ($scope, $http, jtDebug, $log, jtUtils, user, Stats, jtChart) ->
  debug = jtDebug 'jt.addPage'

  

  $scope.intervalList = Stats.getIntervalList()
  $scope.chartTypes = Stats.getChartTypes()

  $scope.config = 
    stats : [
      {
        chart : 'line'
      }
    ]
    chartType : $scope.chartTypes[0].type
  $scope.error = {}
  $scope.dateList = Stats.getDateList()

  $scope.categoryList = JT_GLOBAL.collections
  $scope.keys = {}



  getKeys = jtUtils.memoize Stats.getKeys



  $scope.selectChartType = (type) ->
    $scope.config.chartType = type

  $scope.addParamSelector = ->
    $scope.config.stats.push {
      chart : $scope.config.chartType
    }

  $scope.deleteParamSelector = (index) ->
    $scope.config.stats.splice index, 1


  $scope.save = ->
    config = $scope.config
    msgList = []
    msgList.push '请选择时间间隔' if !config.interval

    msgList.push '请选择开始日期' if !config.startDate && config.startDate != 0

    msgList.push '请选择结束日期' if !config.endDate && config.endDate != 0

    if msgList.length
      $scope.error.save = msgList.join ','
      return

    options =
      name : $scope.name
      type : config.chartType
      point :
        interval : Stats.convertInterval config.interval
      date :
        start : config.startDate
        end : config.endDate
      stats : []

    angular.forEach config.stats, (tmp) ->
      statConfig =
        chart : tmp.chart
        category : tmp.category
        keys : []
      angular.forEach tmp.keys, (v, k) ->
        if v
          statConfig.keys.push {
            value : k
          }
      options.stats.push statConfig
    debug "options:%j", options
    jtChart.getData options, (err, data) ->
      console.dir data

    # console.dir config.stats

    # console.dir data

  $scope.$watch 'config.stats', (newValues, oldValues) ->
    angular.forEach newValues, (newValue, i) ->
      oldValue = oldValues[i]
      category = newValue.category

      # 判断该category对应的key是否有获取
      if category && category != oldValue.category
        if !$scope.keys[category]
          getKeys category, (err, keys) ->
            if keys
              $scope.keys[category] = keys
            return
      return
  , true

  $scope.$watch 'config.chartType', (v) ->
    typeMap = 
      'line' : 'line stack'.split ' '
      'bar' : 'barVertical barHorizontal stackBarVertical stackBarHorizontal'.split ' '
      'pie' : 'pie nestedPie'
    defaultType = 'none'
    angular.forEach typeMap, (charts, type) ->
      if ~charts.indexOf v
        defaultType = type
      return
    angular.forEach $scope.config.stats, (stat) ->
      stat.chart = defaultType
      return

  $scope.$watch 'config.date', (v)->
    dateRange = Stats.getDateRange v
    if dateRange
      $scope.config.startDate = dateRange[0]
      $scope.config.endDate = dateRange[1]


fn.$inject = ['$scope', '$http', 'jtDebug', '$log', 'jtUtils', 'user', 'Stats', 'jtChart']

JT_APP.addRequires ['jt.addPage', 'jt.chart']
JT_APP.controller 'AddPageController', fn



