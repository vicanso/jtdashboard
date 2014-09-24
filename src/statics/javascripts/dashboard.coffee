fn = ($scope, $http, jtDebug, $log, user) ->
  debug = jtDebug 'jt.dashboard'
  debug 'start'

  $scope.setList = JT_GLOBAL.setList

  $scope.chartType = ''

  $scope.selectedSetList = []


  $scope.show = (index) ->
    set = $scope.setList[index]
    index = $scope.selectedSetList.indexOf set
    if ~index
      $scope.selectedSetList.splice index, 1
    else
      angular.forEach $scope.selectedSetList, (tmp) ->
        tmp.selected = false
        return
      set.selected = true
      $scope.selectedSetList.push set
    return


fn.$inject = ['$scope', '$http', 'jtDebug', '$log', 'user']
JT_APP.controller 'DashboardController', fn



