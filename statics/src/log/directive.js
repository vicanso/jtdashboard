;(function(global){
'use strict';
var app = angular.module('jtApp');

app.directive('jtLog', jtLog);

function jtLog($compile){
  return {
    restrict : 'E',
    scope : {
      data : '=jtData'
    },
    link : function(scope, element, attr){
      var appendIndex = 0;
      var ctrlsHtml = '<div class="ctrls">' +
        '<a class="glyphicon glyphicon-pushpin" ng-class="{selected : bottom}" ng-click="bottom = !bottom" href="javascript:;"></a>' +
      '</div>';
      // 用于fitler log的显示
      var filter = null;
      // 是否固定log底部显示
      scope.bottom = true;
      element.append(ctrlsHtml);
      var msgContainer = angular.element('<div></div>');
      element.append(msgContainer);
      $compile(element.children())(scope);
      scope.$watchCollection('data', function(v){
        if(v && v.length){
          appendLog(v);
        }
      });

      /**
       * [getRegFilter 返回filter函数]
       * @param  {[type]} arr  [description]
       * @param  {[type]} type [description]
       * @return {[type]}      [description]
       */
      var getRegFilter = function(arr, type){
        type = type || 'and';
        return function(msg){
          var result;
          if(type === 'or'){
            result = false;
          }else{
            result = true;
          }
          angular.forEach(arr, function(key){
            var reg = new RegExp(key, 'gi');
            console.dir(reg.exec(msg));
            if(type === 'or'){
              if(!result){
                result = reg.test(msg);
              }
            }else{
              if(result){
                result = reg.test(msg);
              }
            }
          });
          return {
            filter : result
          };
        }
      };

      // 监控key的变化，对消息记录做filter
      scope.$watch('key', function(v){
        if(v){
          if(v.indexOf('||') !== -1){
            filter = getRegFilter(v.split('||'), 'or');
          }else if(v.indexOf('&&') !== -1){
            filter = getRegFilter(v.split('&&'), 'and');
          }else{
            filter = getRegFilter([v]);
          }
          appendIndex = 0;
          msgContainer.empty();
          appendLog(scope.data);
        }
      });


      setTimeout(function(){
        scope.$apply(function(){
          scope.key = 'haproxy';
        });
      }, 10000);

      /**
       * [appendLog 插入消息]
       * @param  {[type]} list [description]
       * @return {[type]}      [description]
       */
      function appendLog(list){
        var total = list.length;
        var msgList = list.slice(appendIndex, total);
        appendIndex = total;
        var arr = [];
        angular.forEach(msgList, function(item){
          var topic = item.topic;
          var msg = item.msg;
          if(filter){
            var result = filter(msg);
            if(!result.filter){
              return; 
            }else{

            }
          }
          var topicHtml = '<span class="topic">' + topic + '</span>';
          arr.push('<p>' + topicHtml + msg + '</p>');
        });
        msgContainer.append(arr.join(''));
        if(scope.bottom){
          element.scrollTop(Number.POSITIVE_INFINITY);
        }
      }
    }
  }
}
jtLog.$inject = ['$compile'];
})(this);