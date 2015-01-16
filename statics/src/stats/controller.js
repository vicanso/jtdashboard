;(function(global){
'use strict';


angular.module('jtApp')
  .controller('StatsController', Stats);

function Stats($scope, $http, $element, $timeout, debug) {
  debug = debug('homePage');


}

Stats.$inject = ['$scope', '$http', '$element', '$timeout', 'debug'];



})(this);