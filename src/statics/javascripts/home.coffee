fn = ($scope, $http, debug, $log, utils, user, Book) ->
  debug = debug 'jt.homePage'
  debug Book
  debug 'start'

  $scope.chartType = ''

  user.getInfo (err, data) ->
    console.dir data

fn.$inject = ['$scope', '$http', 'debug', '$log', 'utils', 'user', 'Book']
JT_APP.addRequires ['jt.book']
JT_APP.controller 'HomePageController', fn



