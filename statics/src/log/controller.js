;(function(global){
'use strict';


angular.module('jtApp')
  .controller('LogController', LogCtrl);


function LogCtrl($scope, $element, io, utils){
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



  init('//' + location.host + '/');

  // for test
  // setTimeout(function(){
  //   ctrl.filter.key = 'trees-MacBook-Air.local.mongodb';
  //   $scope.$apply(function(){
  //     show();
  //   });
  // }, 1000);


  var logList = $element.children();


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

  function remove(topic){
    var index = watchTopicList.indexOf(topic);
    if(index !== -1){
      watchTopicList.splice(index, 1);
      io.unwatch(topic);
    }
  }

}

LogCtrl.$inject = ['$scope', '$element', 'io', 'utils'];

})(this);
