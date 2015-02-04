;(function(global){
'use strict';
var app = angular.module('jtApp');

app.directive('jtLog', jtLog);

function jtLog($compile){
  return {
    restrict : 'E',
    scope : {
      data : '=jtData'
      // bottom : true
    },
    link : function(scope, element, attr){
      var appendIndex = 0;
      var ctrlsHtml = '<div class="ctrls">' +
        '<a class="glyphicon glyphicon-pushpin" ng-class="{selected : bottom}" ng-click="bottom = !bottom" href="javascript:;"></a>' +
      '</div>';
      // 是否固定log底部显示
      scope.bottom = true;
      element.append(ctrlsHtml);
      $compile(element.children())(scope);
      scope.$watchCollection('data', function(v){
        if(v && v.length){
          appendLog(v);
        }
      });


      function appendLog(list){
        var total = list.length;
        var msgList = list.slice(appendIndex, total);
        appendIndex = total;
        var arr = [];
        angular.forEach(msgList, function(item){
          var topic = item.topic;
          var msg = item.msg;
          var topicHtml = '<span class="topic">' + topic + '</span>';
          arr.push('<p>' + topicHtml + msg + '</p>');
        });
        element.append(arr.join(''));
        if(scope.bottom){
          element.scrollTop(Number.POSITIVE_INFINITY);
        }
      }
    }
  }
}
jtLog.$inject = ['$compile'];
})(this);