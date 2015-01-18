;(function(global){
'use strict';


angular.module('jtApp')
  .controller('StatsController', StatsCtrl);

function StatsCtrl($scope, $http, $element, $timeout, debug, stats) {
  debug = debug('homePage');

  setTimeout(function(){
    stats.get('server-black', {key : 'cpu1.busy', date : '2015-01-16', interval : 700}).then(function(){

    }, function(){

    });
  }, 1000);
}

StatsCtrl.$inject = ['$scope', '$http', '$element', '$timeout', 'debug', 'stats'];



})(this);