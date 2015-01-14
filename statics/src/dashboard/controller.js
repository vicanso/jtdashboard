;(function(global){
'use strict';


angular.module('jtApp')
  .controller('DashboardController', Dashboard);

function Dashboard($scope, $http, $element, $timeout, debug) {
  debug = debug('homePage');


}

Dashboard.$inject = ['$scope', '$http', '$element', '$timeout', 'debug'];



})(this);