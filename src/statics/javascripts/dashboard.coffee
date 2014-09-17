fn = ($scope, $http, jtDebug, $log, user) ->
  debug = jtDebug 'jt.dashboard'
  debug 'start'

  $scope.chartType = ''


fn.$inject = ['$scope', '$http', 'jtDebug', '$log', 'user']
JT_APP.controller 'DashboardController', fn



