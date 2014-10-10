module = angular.module 'jt.configsPage', []

fn = ($scope, $http, $element, jtDebug) ->
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



  tmpOptions = `{"name":"PV分类统计","desc":"PV页面分类统计（间隔为1分钟）","type":"line","point":{"interval":-1}, "refreshInterval" : 10 * 1000, "date":{"start":"2014-08-05","end":"2014-08-05"},"stats":[{"chart":"line","category":"haproxy","keys":[{"value":"pv.category"},{"value":"pv.doc"},{"value":"pv.home"},{"value":"pv.item"}]}],"cache":false}`

  setTimeout ->
    $scope.$apply ->
      $scope.statsOptions = tmpOptions
  , 1000

  # loading = false
  showChart = (item) ->
    

    $scope.error.preview = ''
    options = angular.copy item
    delete options.$$hashKey
    delete options._id
    $scope.statsOptions = options
    previewContainer.removeClass 'hidden'
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
      return
    , (res) ->
      $scope.success.save = ''
      $scope.error.save = '保存不成功'
      return
    return
    
  return



fn.$inject = ['$scope', '$http', '$element', 'jtDebug']

angular.module('jtApp')
  .addRequires(['jt.configsPage', 'jt.chart'])
  .controller 'ConfigsPageController', fn