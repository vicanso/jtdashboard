;(function(global){
'use strict';


angular.module('jtApp')
  .controller('StatsController', StatsCtrl);

function StatsCtrl($scope, $http, $element, $timeout, debug, stats) {
  debug = debug('homePage');

  var self = this;

  stats.format = 'text';

  stats.getServerStats('server-black', '2015-01-20', 1200).success(function(res){
    var arr = [];
    angular.forEach(res, function(data){
      if(data.key.indexOf('mem') === 0){
        arr.push(data);
      }
    })
    self.data = arr;
    // console.dir(res);
  });
return;
var chart = c3.generate({
    data: {
        xs: {
            'data1': 'x1',
            'data2': 'x2',
        },
        columns: [
            ['x1', 10, 30, 45, 50, 70, 100],
            ['x2', 30, 50, 75, 100, 120],
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 20, 180, 240, 100, 190]
        ]
    }
});

}

StatsCtrl.$inject = ['$scope', '$http', '$element', '$timeout', 'debug', 'stats'];



})(this);