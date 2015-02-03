;(function(global){
'use strict';


angular.module('jtApp')
  .controller('LogController', LogCtrl);


function LogCtrl($scope, $element, io){
  var ctrl = this;

  ctrl.log = {
    status : '',
    key : ''
  };


  ctrl.show = show;








  io.connect('http://localhost:10000/');

  io.on('connect', function(){
    ctrl.log.status = 'connect';
  });


  var logList = $element.children();


  function show(){
    console.dir(ctrl.log);
  };

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
