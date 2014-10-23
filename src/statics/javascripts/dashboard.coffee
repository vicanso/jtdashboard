module = angular.module 'jt.dashboardPage', []

module.factory 'jtSet', ['$http', 'jtDebug', ($http, jtDebug) ->
  debug = jtDebug 'jt.jtSet'


  set = 
    get : (id, cbf) ->
      $http.get("/set/#{id}", {cache : true}).success (res) ->
        cbf null, res
      .error (err) ->
        cbf err

  set
]

fn = ($scope, $http, jtDebug, $log, user, jtSet) ->
  debug = jtDebug 'jt.dashboardPage'
  debug 'start'

  $scope.setList = JT_GLOBAL.setList


  $scope.chartType = ''

  $scope.selectedSetList = []


  $scope.add = (index) ->
    set = $scope.setList[index]
    index = $scope.selectedSetList.indexOf set
    if !~index
      $scope.show set
      $scope.selectedSetList.push set
    return

  $scope.remove = (set) ->
    index = $scope.selectedSetList.indexOf set
    if ~index
      $scope.selectedSetList.splice index, 1
    return

  $scope.show = (set) ->
    if set.selected
      return
    angular.forEach $scope.selectedSetList, (tmp) ->
      tmp.selected = false
      return
    set.selected = true
    jtSet.get set._id, (err, data) ->
      if data?.configs?.length
        # data.configs.length = 3
        $scope.configs = data.configs
      return
    return
  if JT_GLOBAL.selectedSetId
    do ->
      index = -1
      angular.forEach $scope.setList, (set, i) ->
        index = i if JT_GLOBAL.selectedSetId == set._id
        return
      $scope.add index if ~index
      return
  return

fn.$inject = ['$scope', '$http', 'jtDebug', '$log', 'user', 'jtSet']

angular.module('jtApp')
  .addRequires(['jt.dashboardPage'])
  .controller 'DashboardController', fn



