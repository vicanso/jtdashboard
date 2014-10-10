fn = ($scope, $http, debug, $log, utils, user) ->
  debug = debug 'jt.homePage'
  debug 'start'

  $scope.chartType = ''

  user.getInfo (err, data) ->
    console.dir data

  return

fn.$inject = ['$scope', '$http', 'debug', '$log', 'utils', 'user']
angular.module('jtApp').controller 'HomePageController', fn



