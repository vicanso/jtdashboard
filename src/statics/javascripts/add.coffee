fn = ($scope, $http, debug, $log, utils, user) ->
  debug = debug 'jt.addPage'
  $scope.selectChartType = (type) ->
    $scope.chartType = type


fn.$inject = ['$scope', '$http', 'debug', '$log', 'utils', 'user']
JT_APP.controller 'AddPageController', fn



