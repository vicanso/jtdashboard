module = angular.module 'jt.addPage', []

module.factory 'jtStatsConfig', ['$http', 'jtDebug', ($http, jtDebug) ->
  debug = jtDebug 'jt.jtStatsConfig'
  intervalConvertInfos = 
    '最近' : -1
    '10秒' : 10
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
        debug 'getKeys res:%j', res
        cbf null, res
      ).error (err) ->
        debug 'getKeys err:%j', err
        cbf err
    getIntervalList : ->
      '最近 10秒 1分钟 5分钟 10分钟 30分钟 1小时 2小时 6小时 12小时 1天'.split ' '
    convertInterval : (interval) ->
      intervalConvertInfos[interval]

    getIntervalName : (interval) ->
      name = ''
      angular.forEach intervalConvertInfos, (v, k) ->
        name = k if interval == v
        return
      name

    getDateList : ->
      '当天 7天 15天 30天 当月'.split ' '

    getDateRange : (v) ->
      dateRangeConfigs[v]

    getChartTypes : ->
      JT_GLOBAL.chartTypes
  stats
]

fn = ($scope, $http, $element, $timeout, jtDebug, $log, jtUtils, user, jtStatsConfig) ->
  debug = jtDebug 'jt.addPage'


  $scope.intervalList = jtStatsConfig.getIntervalList()
  $scope.chartTypes = jtStatsConfig.getChartTypes()


  $scope.config = 
    stats : [
      {
        chart : 'line'
      }
    ]
    chartType : $scope.chartTypes[0].type

   $timeout ->
    return if !JT_GLOBAL.config
    tmpStats = []
    keysList = []
    angular.forEach JT_GLOBAL.config.stats, (statConfig) ->
      keys = {}
      angular.forEach statConfig.keys, (keyInfo) ->
        keys[keyInfo.value] = true
        return
      tmpStats.push {
        category : statConfig.category
        chart : statConfig.chart
      }
      keysList.push keys
      return
    $scope.config = 
      name : JT_GLOBAL.config.name
      desc : JT_GLOBAL.config.desc
      stats : tmpStats
      interval : jtStatsConfig.getIntervalName JT_GLOBAL.config.point.interval
      startDate : JT_GLOBAL.config.date.start
      endDate : JT_GLOBAL.config.date.end
      chartType : JT_GLOBAL.config.type
      refreshInterval : JT_GLOBAL.config.refreshInterval
    $timeout ->
      angular.forEach $scope.config.stats, (statsConfig, i) ->
        statsConfig.keys = keysList[i]
        return
    , 100
    return
  , 100
  # $scope.chartTypeStatusDict = {
  #   line : true
  #   bar : true
  #   pie : true
  # }
  $scope.error = {}
  $scope.success = {}
  $scope.dateList = jtStatsConfig.getDateList()

  $scope.categoryList = JT_GLOBAL.collections
  $scope.keys = {}



  getKeys = jtUtils.memoize jtStatsConfig.getKeys


  getStatsOptions = ->
    config = $scope.config
    msgList = []
    msgList.push '请选择时间间隔' if !config.interval

    msgList.push '请选择开始日期' if !config.startDate && config.startDate != 0

    msgList.push '请选择结束日期' if !config.endDate && config.endDate != 0

    if msgList.length
      $scope.error.save = msgList.join ','
      return
    refreshInterval = config.refreshInterval
    options =
      name : config.name
      desc : config.desc
      type : config.chartType
      point :
        interval : jtStatsConfig.convertInterval config.interval
      date :
        start : config.startDate
        end : config.endDate
      refreshInterval : refreshInterval
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
      if tmp.regKey
        statConfig.keys.push {
          value : tmp.regKey
          type : 'reg'
        }
      options.stats.push statConfig
    debug "options:%j", options
    options


  $scope.selectChartType = (type) ->
    $scope.config.chartType = type
    return

  $scope.addParamSelector = ->
    $scope.config.stats.push {
      chart : $scope.config.chartType
    }
    return

  $scope.deleteParamSelector = (index) ->
    $scope.config.stats.splice index, 1
    return


  $scope.preview = ->
    $scope.error.save = ''
    options = getStatsOptions()
    $scope.statsOptions = options
    # console.dir options
    # if options.type == 'table'
    #   $scope.chartOptions = null
    #   $scope.tableOptions = options
    # else
    #   $scope.tableOptions = null
    #   $scope.chartOptions = options
    return

  $scope.save = ->
    $scope.error.save = ''
    options = getStatsOptions()
    errMsgs = []
    errMsgs.push '统计名称不能为空' if !options.name
    errMsgs.push '统计描述不能为空' if !options.desc
    if errMsgs.length
      $scope.error.save = errMsgs.join ','
      return
    success = (res, status) ->
      $scope.success.save = '已成功保存配置，3秒后刷新页面'
      $timeout ->
        window.location.reload()
      , 3000
      return
    error = (err, status) ->
      $scope.error.save = '保存配置失败，' + err.msg
      return
    url = '/config'
    if JT_GLOBAL.config
      url += "/#{JT_GLOBAL.config._id}"
    $http.post(url, options).success(success).error error
    return



  $scope.$watch 'config.stats', (newValues, oldValues) ->
    angular.forEach newValues, (newValue, i) ->
      oldValue = oldValues[i]
      category = newValue.category

      # 判断该category对应的key是否有获取
      if category && category != oldValue?.category
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
    if defaultType == 'pie'
      $scope.chartTypeStatusDict =
        line : false
        bar : false
        pie : true
    else if defaultType == 'line' || defaultType == 'bar'
      $scope.chartTypeStatusDict =
        line : true
        bar : true
        pie : false
    else
      $scope.chartTypeStatusDict = 
        line : false
        bar : false
        pie : false

    return

  $scope.$watch 'config.date', (v)->
    dateRange = jtStatsConfig.getDateRange v
    if dateRange
      $scope.config.startDate = dateRange[0]
      $scope.config.endDate = dateRange[1]
    return

  $element.removeClass 'hidden'

  return


fn.$inject = ['$scope', '$http', '$element', '$timeout', 'jtDebug', '$log', 'jtUtils', 'user', 'jtStatsConfig']
angular.module('jtApp')
  .addRequires(['jt.addPage'])
  .controller 'AddPageController', fn



