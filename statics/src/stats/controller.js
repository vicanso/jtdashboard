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

  ctrl.servers = {
    // 状态：loading、success、error
    stats : '',
    // 有监控的服务器名称
    data : null
  };


  ctrl.showServerStats = function(server){
    var promise = stats.getServerStats(server, '2015-01-16', 60);
    showStats(promise);
  };


  function showStats(promise){
    ctrl.charts.status = 'loading';
    promise.success(function(res){
      ctrl.charts.status = 'success';
      ctrl.charts.data = res;
    }).error(function(res){
      ctrl.charts.status = 'error';
      ctrl.charts.error = res.msg || res.error;
    });
  }


  // stats.getServerStats(server, date, interval)
  // var serverPromise = stats.getServerStats('server-black', '2015-01-16', 60);
  // showStats(serverPromise);

  // var mongodbPromise = stats.getMongodbStats('mongodb', '2015-01-16', 60);
  // showStats(mongodbPromise);

  ctrl.servers.status = 'loading';
  stats.getServers().success(function(data){
    ctrl.servers.status = 'success';
    ctrl.servers.data = data;
  }).error(function(res){
    ctrl.servers.status = 'error';
    ctrl.servers.error = res.msg || res.error;
  });

}

StatsCtrl.$inject = ['$scope', '$http', '$element', '$timeout', 'debug', 'stats'];



})(this);