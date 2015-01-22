;(function(global){
'use strict';


angular.module('jtApp')
  .controller('StatsController', StatsCtrl);

function StatsCtrl($scope, $http, $element, $timeout, debug, stats) {
  debug = debug('homePage');

  var ctrl = this;

  ctrl.charts = {
    // 状态：loading、success、error
    status : '',
    // 出错消息
    error : '',
    // chart的数据
    data : null
  };

  stats.format = 'text';




  function showServerStats(server, date, interval){
    interval = interval || 60;
    ctrl.charts.status = 'loading';
    stats.getServerStats(server, date, interval).success(function(res){
      ctrl.charts.status = 'success';
      ctrl.charts.data = res;
    }).error(function(res){
      ctrl.charts.status = 'error';
      ctrl.charts.error = res.msg || res.error;
    });
  }

  showServerStats('server-black', '2015-01-16', 60);


}

StatsCtrl.$inject = ['$scope', '$http', '$element', '$timeout', 'debug', 'stats'];



})(this);