;(function(global){
'use strict';


angular.module('jtApp')
  .controller('StatsController', StatsCtrl);

function StatsCtrl($scope, $http, $element, $timeout, debug, stats, utils, user) {
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
    status : '',
    // 服务器信息
    data : null
  };


  // 当前所选服务器
  ctrl.currentServer = null;

  // 统计配置信息
  ctrl.conditions = {
    status : ''
  };


  ctrl.session = {
    status : 'loading'
  };


  ctrl.servers.status = 'loading';
  stats.getServers().success(function(data){
    ctrl.servers.status = 'success';
    ctrl.servers.data = data;
  }).error(function(res){
    ctrl.servers.status = 'error';
    ctrl.servers.error = res.msg || res.error;
  });


  user.session().success(function(res){
    angular.extend(ctrl.session, res);
    ctrl.session.status = 'success';
  }).error(function(res){
    ctrl.session.status = 'error';
    ctrl.session.error = res.msg || res.error;
  });



  ctrl.showServerStats = function(server){

    ctrl.currentServer = server;
    var name = server.name;
    var type = server.type;
    var promise = null;
    var date = ctrl.conditions.date;
    if(date){
      if(date.indexOf(',') !== -1){
        date = date.split(',');
      }
    }else{
      date = utils.getDate();
    }
    var interval = ctrl.conditions.interval || 60;
    switch(type){
      case 'server':
        promise = stats.getServerStats(name, date, interval);
        break;
      case 'mongodb':
        promise = stats.getMongodbStats(name, date, interval);
        break;
    }
    if(promise){
      showStats(promise);
    }
  };

  ctrl.refresh = function(){
    var server = ctrl.currentServer;
    if(server){
      ctrl.showServerStats(server);
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

  

}

StatsCtrl.$inject = ['$scope', '$http', '$element', '$timeout', 'debug', 'stats', 'utils', 'user'];



})(this);