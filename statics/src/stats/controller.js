;(function(global){
'use strict';


angular.module('jtApp')
  .controller('StatsController', StatsCtrl);

function StatsCtrl($scope, $http, $element, $timeout, debug, stats, utils) {
  debug = debug('homePage');

  stats.format = 'text';


  var ctrl = this;

  ctrl.charts = {
    // 状态：loading、success、error
    status : '',
    // 出错消息
    error : '',
    // chart的数据
    data : null
  };

  ctrl.servers = {
    // 状态：loading、success、error
    stats : '',
    // 服务器名称
    data : null
  };

  ctrl.mongodbServers = {
    // 状态：loading、success、error
    stats : '',
    // mongodb服务器名称
    data : null
  };

  // 当前所选服务器
  ctrl.currentServer = '';


  ctrl.showServerStats = function(server){
    var name = server.name;
    var type = server.type;
    var promise = null;
    var date = utils.getDate();
    ctrl.currentServer = name;
    switch(type){
      case 'server':
        promise = stats.getServerStats(name, date, 60)
        break;
      case 'mongodb':
        promise = stats.getMongodbStats(name, date, 60);
        break;
    }
    if(promise){
      showStats(promise);
    }
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

StatsCtrl.$inject = ['$scope', '$http', '$element', '$timeout', 'debug', 'stats', 'utils'];



})(this);