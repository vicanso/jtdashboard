;(function(global){
'use strict';


angular.module('jtApp')
  .controller('StatsController', StatsCtrl);

function StatsCtrl($scope, $http, $element, $timeout, $compile, debug, stats, utils, user) {
  debug = debug('stats');

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

  ctrl.myStats = {
    // 状态：loading、success、error
    status : '',
    // stats配置
    data : null
  };


  // 当前所选stats
  ctrl.currentStats = null;

  // 统计配置信息
  ctrl.conditions = {
    status : ''
  };


  // session信息
  ctrl.session = {
    status : 'loading'
  };


  

  $scope.$on('user', function(e, res){
    angular.extend(ctrl.session, res);
    ctrl.session.status = 'success';
    if(!res.anonymous){
      getMyStats();
    }
    
  });
  user.session();

  // 添加统计配置
  ctrl.addStats = function(){
    var obj = angular.element(angular.element('#addStatsDialog').html());
    var tmpScope = $scope.$new(true);
    var params = 'name type category date interval'.split(' ');
    angular.extend(tmpScope, {
      status : 'show',
      modal : true
    });

    $compile(obj)(tmpScope);
    $element.append(obj);
    angular.forEach(params, function(param){
      tmpScope.$watch(param, function(cur, prev){
        if(cur !== prev){
          tmpScope.error = '';
        }
      });
    });
    tmpScope.submit = function(){
      tmpScope.error = '';
      var valid = true;
      angular.forEach(params, function(param){
        if(valid && !tmpScope[param]){
          valid = false;
        }
      });
      if(!valid){
        tmpScope.error = '参数不能为空';
        return;
      }
      var dateList = tmpScope.date.split(',');
      var result = [];
      angular.forEach(dateList, function(date){
        var str = date.trim();
        if(str){
          result.push(str);
        }
      });
      if(result.length === 1){
        result = result[0];
      }
      var data = {
        type : tmpScope.type,
        name : tmpScope.name,
        category : tmpScope.category,
        date : result,
        interval : tmpScope.interval
      };
      tmpScope.msg = '正在提交，请稍候...';
      tmpScope.submiting = true;
      stats.add(data).success(function(){
        tmpScope.destroy();
      }).error(function(res){
        tmpScope.submiting = false;
        tmpScope.error = res.msg || res.error || '未知异常';
        tmpScope.msg = '';
      });
    };

  };

  // ctrl.addStats();

  // 根据统计的配置显示相应的统计数据
  ctrl.showStats = function(currentStats){

    ctrl.currentStats = currentStats;
    var name = currentStats.name;
    var type = currentStats.type;
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

  // 重新加载统计图表
  ctrl.reload = function(){
    var currentStats = ctrl.currentStats;
    if(currentStats){
      ctrl.showStats(currentStats);
    }
  };


  // 显示统计数据
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


  function getMyStats(){
    stats.getStats().success(function(data){
      ctrl.myStats.status = 'success';
      ctrl.myStats.data = data;
    }).error(function(res){
      ctrl.myStats.status = 'error';
      ctrl.myStats.error = res.msg || res.error;
    });
  }
  

}

StatsCtrl.$inject = ['$scope', '$http', '$element', '$timeout', '$compile', 'debug', 'stats', 'utils', 'user'];



})(this);