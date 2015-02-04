;(function(global){
'use strict';


angular.module('jtApp')
  .controller('LogController', LogCtrl);


function LogCtrl($scope, $element, io){
  var ctrl = this;

  ctrl.filter = {
    key : ''
  };

  // 消息列表
  ctrl.messageList = [];

  // 与服务器的连接状态
  ctrl.status = '';

  // 显示log节点的消息
  ctrl.show = show;

  // 输入log节点后按回车时的确定
  ctrl.confirm = confirm;


  // ctrl.viewOptions = {
  //   // 表示log是否固定显示最底
  //   bottom : true
  // };

  var watchTopicList = [];




  init('http://localhost:10000/');

  // setTimeout(function(){
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

  function init(url){
    io.connect(url);
    ctrl.status = 'connecting';
    io.on('connect', function(){
      ctrl.status = 'connect';
    });
    io.on('log', function(data){
      ctrl.messageList.push(data);
      $scope.$digest();
      // var msgData = find(data.topic);
      // if(msgData){

      //   msgData.data.push(data.msg);
      //   msgData.total = msgData.data.length;
      //   $scope.$digest();
      // }
    });
  }


  // socket.on('log', function (data) {
  //   console.log(data);
  //   appendLog(data.topic, data.msg);
  // });
  // socket.on('connect', function(){
  //   socket.emit('watch', 'haproxy')
  // });

  function appendLog(topic, msg){
    topic = '<span class="topic">' + topic + '</span>';
    logList.append('<p>' + topic + msg + '</p>');
  }

}

LogCtrl.$inject = ['$scope', '$element', 'io'];

})(this);
