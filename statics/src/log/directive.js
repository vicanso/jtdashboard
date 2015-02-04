;(function(global){
'use strict';
var app = angular.module('jtApp');

app.directive('jtLog', jtLog);

function jtLog(){
  return {
    restrict : 'E',
    link : function(scope, element, attr){
      var appendIndex = 0;
      scope.$watch(attr.jtData, function(v){
        if(v){
          appendLog(v);
        }
      }, true);


      function appendLog(item){
        var topic = item.topic;
        var total = item.total;
        var msgList = item.data.slice(appendIndex, total);
        appendIndex = total;
        var arr = [];
        var topicHtml = '<span class="topic">' + topic + '</span>';
        angular.forEach(msgList, function(msg){
          arr.push('<p>' + topicHtml + msg + '</p>');
        });
        element.append(arr.join('')).scrollTop(Number.POSITIVE_INFINITY);
        // element.scrollTop(Number.POSITIVE_INFINITY);
      }
    }
  }
}

})(this);