;(function(global){
'use strict';


angular.module('jtApp')
  .controller('StatsController', StatsCtrl);

function StatsCtrl($scope, $http, $element, $timeout, debug, stats) {
  debug = debug('homePage');

  var self = this;

  stats.format = 'text';




  function showServerStats(server, date, interval){
    interval = interval || 60;

    stats.getServerStats(server, date, interval).success(function(res){
      console.dir(res);
    }).error(function(res){

    });
  }

  showServerStats('server-black', '2015-01-16', 600);

  // var interval = 600;
  // stats.getServerStats('server-black', '2015-01-16', interval).success(function(res){
  //   var arr = [];
  //   angular.forEach(res, function(data){
  //     if(data.key.indexOf('cpu.') !== -1){
  //       arr.push(data);
  //     }
  //   });
  //   console.dir(arr);
  //   self.mem = {
  //     data : arr,
  //     title : 'CPU使用曲线图(server-black)',
  //     interval : interval
  //   };
  //   // console.dir(res);
  // });
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