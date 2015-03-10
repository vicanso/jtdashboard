;(function(global){
'use strict';


angular.module('jtApp')
  .controller('LogController', LogCtrl);


function LogCtrl($scope, $element, io, utils, user){
  var ctrl = this;

  var watchTopicList = [];

  ctrl.filter = {
    key : ''
  };

  // 消息列表
  ctrl.messageList = [];

  // 与服务器的连接状态
  ctrl.io = {
    status : 'connecting'
  };

  // 显示log节点的消息
  ctrl.show = show;

  // 输入log节点后按回车时的确定
  ctrl.confirm = confirm;

  ctrl.watchTopicList = watchTopicList;

  ctrl.remove = remove;

  // session信息
  ctrl.session = {
    status : 'loading'
  };



  

  // for test
  // setTimeout(function(){
  //   ctrl.filter.key = 'trees-MacBook-Air.local.mongodb';
  //   $scope.$apply(function(){
  //     show();
  //   });
  // }, 1000);


  var logList = $element.children();


  $scope.$on('user', function(e, type){
    getSession();
  });
  getSession();


  // 显示用户查看的log
  function show(){
    var topicList = ctrl.filter.key.trim().split(',');
    angular.forEach(topicList, function(topic){
      if(!find(topic)){
        io.watch(topic);
        watchTopicList.push(topic);
      }
    });
  }

  function confirm(e){
    if(e.keyCode === 0x0d){
      show();
    }
  }


  function find(topic){
    var result;
    angular.forEach(watchTopicList, function(item){
      if(!result && item === topic){
        result = item;
      }
    });
    return result;
  }

  var digest = utils.throttle(function(){
    $scope.$digest();
  }, 100);

  // 初始化socket.io
  function init(url){
    io.connect(url);
    io.on('connect', function(){
      ctrl.io.status = 'connect';
    });
    io.on('connect_error', function(){
      ctrl.io.status = 'connect_error';
    });
    io.on('reconnecting', function(){
      ctrl.io.status = 'reconnecting';
    });
    io.on('reconnect', function(){
      angular.forEach(watchTopicList, function(topic){
        io.watch(topic);
      });
    });
    io.on('log', function(data){
      ctrl.messageList.push(data);
      digest();
    });
  }

  // 移除topic
  function remove(topic){
    var index = watchTopicList.indexOf(topic);
    if(index !== -1){
      watchTopicList.splice(index, 1);
      io.unwatch(topic);
    }
  }

  // 获取用户信息
  function getSession(){
    ctrl.session.status = 'loading';
    user.session().then(function(res){
      angular.extend(ctrl.session, res);
      ctrl.session.status = 'success';
      if(!res.anonymous){
        init('//' + location.host + '/');
      }

    }, function(err){
      ctrl.session.error = err;
      ctrl.session.status = 'fail';
    });
  }

}

LogCtrl.$inject = ['$scope', '$element', 'io', 'utils', 'user'];

})(this);
