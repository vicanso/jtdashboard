;(function(global){
'use strict';


angular.module('jtApp')
  .controller('LogController', LogCtrl);


function LogCtrl($scope, $element, io){
  var ctrl = this;

  ctrl.filter = {
    key : ''
  };

  ctrl.messageList = [];

  ctrl.status = '';

  ctrl.show = show;

  ctrl.confirm = confirm;






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
        ctrl.messageList.push({
          topic : topic,
          filter : '',
          total : 0,
          data : []
        });
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
    angular.forEach(ctrl.messageList, function(item){
      if(!result && item.topic === topic){
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
      var msgData = find(data.topic);
      if(msgData){
        msgData.data.push(data.msg);
        msgData.total = msgData.data.length;
        $scope.$digest();
      }
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
