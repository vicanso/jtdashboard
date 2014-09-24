module = angular.module 'jt.configsPage', []




fn = ($scope, $http, $element, jtDebug, jtChart) ->
  debug = jtDebug 'jt.configsPage'
  debug "configs:%j", JT_GLOBAL.configs

  previewContainer = null
  previewContent = null
  angular.forEach $element.children(), (dom) ->
    obj = angular.element dom
    if obj.hasClass 'previewContainer'
      previewContainer = obj
      angular.forEach obj.children(), (dom) ->
        previewContent = angular.element dom if angular.element(dom).hasClass 'content'
        return
    return

  $scope.configs = JT_GLOBAL.configs

  $scope.error = {}

  $scope.success = {}

  $scope.preview = {}

  $scope.selectedItems = []

  $scope.selectedTotal = 0

  $element.removeClass 'hidden'

  $scope.set = {}



  

  loading = false
  showChart = (item) ->
    if loading
      $scope.error.preview = '正在加载数据，请稍候！'
      return 
    loading = true
    $scope.error.preview = ''
    options = angular.copy item
    delete options.$$hashKey
    delete options._id
    jtChart.getData options, (err, data) ->
      loading = false
      if err
        $scope.error.preview = '获取数据失败'
      else
        $scope.error.preview = ''
        tmpObj = angular.element '<div class="chart"></div>'
        previewContent.empty()
        previewContent.append tmpObj
        previewContainer.removeClass 'hidden'
        jtChart[options.type] tmpObj[0], data, {
          title : 
            text : options.name || '未定义'
          interval : options.point?.interval
        }
    return

  showStats = (item) ->
    str = angular.toJson item.stats, true
    tmpObj = angular.element '<pre class="code"><code>' +
      str +
      '</code></pre>'
    previewContent.empty()
    previewContent.append tmpObj
    previewContainer.removeClass 'hidden'   
    return

  $scope.closePreview = ->
    previewContainer.addClass 'hidden'
    return

  $scope.preview = (item, type) ->
    $scope.preview.type = type
    switch type
      when 'stats' then showStats item
      else showChart item
    return


  $scope.toggleSelected = (item) ->
    if item.selected
      index = $scope.selectedItems.indexOf item
      $scope.selectedItems.splice index, 1
    else
      item.area = 1
      $scope.selectedItems.push item
    item.selected = !item.selected
    return


  $scope.save = ->
    if !$scope.set.name
      return
    data = 
      name : $scope.set.name
    configs = []
    angular.forEach $scope.selectedItems, (item) ->
      configs.push {
        id : item._id
        area : item.area
      }
    data.configs = configs
    $http.post('/set', data).then (res)->
      $scope.error.save = ''
      $scope.success.save = '已成功保存该配置'
    , (res) ->
      $scope.success.save = ''
      $scope.error.save = '保存不成功'
    return




fn.$inject = ['$scope', '$http', '$element', 'jtDebug', 'jtChart']

JT_APP.addRequires ['jt.configsPage', 'jt.chart']
JT_APP.controller 'ConfigsPageController', fn