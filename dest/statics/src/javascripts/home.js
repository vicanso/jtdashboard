(function() {
  var fn;

  fn = function($scope, $http, debug, $log, utils, user) {
    debug = debug('jt.homePage');
    debug('start');
    $scope.chartType = '';
    user.getInfo(function(err, data) {
      return console.dir(data);
    });
  };

  fn.$inject = ['$scope', '$http', 'debug', '$log', 'utils', 'user'];

  angular.module('jtApp').controller('HomePageController', fn);

}).call(this);
