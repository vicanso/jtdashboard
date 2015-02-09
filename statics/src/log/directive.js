;(function(global){
'use strict';
var app = angular.module('jtApp');

app.directive('jtLog', jtLog);


var logFormatter = {
  haproxy : haproxyFormatter
};

function jtLog($compile, utils){
  return {
    restrict : 'E',
    scope : {
      data : '=jtData'
    },
    link : function(scope, element, attr){
      var appendIndex = 0;

      var ctrlsHtml = '<div class="ctrls input-group">' +
        '<span class="input-group-addon ctrl" ng-class="{selected : filter}" ng-click="filter = !filter"><i class="glyphicon glyphicon-filter"></i></span>' +
        '<input type="text" class="form-control keyword" placeholder="请输入关键字" ng-model="key" />' +
        '<span class="input-group-addon ctrl" ng-class="{selected : bottom}" ng-click="bottom = !bottom"><i class="glyphicon glyphicon-pushpin"></i></span>' +
      '</div>';


      // 用于fitler log的显示
      var filterHandler = null;
      // 是否固定log底部显示
      scope.bottom = true;
      // 是否显示关键字筛选
      scope.filter = false;
      element.append(ctrlsHtml);
      var msgContainer = angular.element('<div class="msgContainer"></div>');
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
          var newMsg = msg;
          angular.forEach(arr, function(key){
            var reg = new RegExp('(' + key + ')', 'gi');
            newMsg = newMsg.replace(reg, '<span class="key">$1</span>');
            if(type === 'or'){
              if(!result){
                result = newMsg !== msg;
              }
            }else{
              if(result){
                result = newMsg !== msg;
              }
            }
          });
          return {
            filter : result,
            msg : newMsg
          };
        };
      };

      // 监控key的变化，对消息记录做filter
      
      var filterLog = function(){
        var key = scope.key;
        var filter = scope.filter;
        if(key && filter){
          if(key.indexOf('||') !== -1){
            filterHandler = getRegFilter(key.split('||'), 'or');
          }else if(key.indexOf('&&') !== -1){
            filterHandler = getRegFilter(key.split('&&'), 'and');
          }else{
            filterHandler = getRegFilter([key]);
          }
        }else{
          filterHandler = null;
        }
        appendIndex = 0;
        msgContainer.empty();
        appendLog(scope.data);
      };
      var debounceFn = utils.debounce(function(){
        scope.$apply(filterLog);
      }, 500);
      scope.$watch('key', debounceFn);
      scope.$watch('filter', debounceFn);


      // setTimeout(function(){
      //   scope.$apply(function(){
      //     scope.key = '80port';
      //   });
      // }, 10000);

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
          if(filterHandler){
            var result = filterHandler(msg);
            if(!result.filter){
              return; 
            }
            msg = result.msg;
          }
          var topicHtml = '<span class="topic">' + topic + '</span>';
          var formatter = logFormatter[topic];
          if(formatter){
            msg = formatter(msg);
          }
          arr.push('<p>' + topicHtml + msg + '</p>');
        });
        msgContainer.append(arr.join(''));
        if(scope.bottom){
          msgContainer.scrollTop(Number.POSITIVE_INFINITY);
        }
      }
    }
  };
}
jtLog.$inject = ['$compile', 'utils'];


/**
 * [haproxyFormatter 格式化haproxy的log]
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
function haproxyFormatter(msg){
  var tag = '[HAPROXY]';
  var index = msg.indexOf(tag);
  if(index !== -1){
    msg = msg.substring(index + tag.length);
  }
  console.dir(msg);
  return msg;
}

})(this);