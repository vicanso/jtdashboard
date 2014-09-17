fn = ($scope, $http, debug, $log, utils, user) ->
  debug = debug 'jt.homePage'
  debug 'start'

  $scope.chartType = ''

  user.getInfo (err, data) ->
    console.dir data

fn.$inject = ['$scope', '$http', 'debug', '$log', 'utils', 'user']
JT_APP.controller 'HomePageController', fn



