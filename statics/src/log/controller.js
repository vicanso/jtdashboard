;(function(global){
'use strict';


angular.module('jtApp')
  .controller('LogController', LogCtrl);


function LogCtrl($scope, $element){
  var socket = io.connect('http://localhost:10000/');

  var logList = $element.children();

  socket.on('log', function (data) {
    console.log(data);
    appendLog(data.topic, data.msg);
  });
  socket.on('connect', function(){
    socket.emit('watch', 'haproxy')
  });

  function appendLog(topic, msg){
    topic = '<span class="topic">' + topic + '</span>';
    logList.append('<p>' + topic + msg + '</p>');
  }

}

LogCtrl.$inject = ['$scope', '$element'];

})(this);
