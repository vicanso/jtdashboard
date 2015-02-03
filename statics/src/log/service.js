;(function(global){
'use strict';
var app = angular.module('jtApp');

app.factory('io', socketIO);

function socketIO(){
  var socket;
  var self = {
    connect : connect,
    on : on,
    watch : watch
  };
  return self;
  function connect(url){
    socket = io.connect(url);
  }

  function on(){
    if(!socket){
      throw new Error('socket is not inited');
    }
    socket.on.apply(socket, arguments);
  }

  function watch(topic){
    if(!socket){
      throw new Error('socket is not inited');
    }
    socket.emit('watch', topic);
  }

}
})(this);