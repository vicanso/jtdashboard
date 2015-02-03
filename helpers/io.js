var io = null;
var _ = require('lodash');
var zmq = require('zmq');
var zmqSocket = zmq.socket('sub');
var debug = require('debug')('jtdashboard.io');
var socketDict = {};

zmqSocket.connect('tcp://127.0.0.1:2910');
zmqSocket.on('message', function(topic, msg){
  topic = topic.toString();
  msg = msg.toString();
  _.forEach(socketDict[topic], function(socket){
    socket.emit('log', {
      topic : topic,
      msg : msg
    });
  })
});
exports.init = function(server){
  io = require('socket.io')(server);
  io.on('connection', function(socket){
    socket.on('connect', function(){
      debug('io connect');
    });
    socket.on('disconnect', function(){
      _.forEach(socketDict, function(list){
        _.remove(list, function(item){
          return item === socket;
        });
      });
      debug('io disconnect');
    });
    socket.on('watch', function(data){
      if(data){
        zmqSocket.subscribe(data);
      }
      if(!socketDict[data]){
        socketDict[data] = [socket];
      }else if(!_.find(socketDict[data], socket)){
        socketDict[data].push(socket);
      }
    });
  });
};