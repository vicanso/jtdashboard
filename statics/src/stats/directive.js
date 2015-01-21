;(function(global){
'use strict';
var app = angular.module('jtApp');

app.directive('jtChart', chart);

function chart(STATS_SETTING){
  return {
    link : function(scope, element, attr){
      console.dir('.....');
      element.html('<h3 class="title text-center"></h3><div class="chartContainer"></div>');
      var children = element.children();
      // var bindto = element.children().children();
      
      
      scope.$watch(attr.jtChart, function(v){
        if(v){
          generate(v);
        }
      }, true);


      /**
       * [getData 获取c3使用的数据]
       * @param  {[type]} arr [description]
       * @return {[type]}     [description]
       */
      function getData(arr){
        var columns = [];
        var index = 1;
        var xs = {};
        angular.forEach(arr, function(data){
          var columnData = [data.key];
          var name = 'x' + index;
          xs[data.key] = name;
          var timeColumn = [name];
          angular.forEach(data.values, function(tmp){
            columnData.push(tmp.v);
            timeColumn.push(tmp.t * 1000);
          });
          columns.push(columnData);
          columns.push(timeColumn);
          index++;
        });
        return {
          xs : xs,
          columns : columns
        };
      }

      function getMaxPointCount(columns){
        var max = -1;
        angular.forEach(columns, function(column){
          max = Math.max(column.length, max);
        });
        return max;
      }

      /**
       * [generate 生成图表]
       * @param  {[type]} config [description]
       * @return {[type]}        [description]
       */
      function generate(config){
        if(config.title){
          children.eq(0).html(config.title);
        }
        var data = getData(config.data);
        var max = getMaxPointCount(data.columns);
        data.type = config.type;
        var interval = config.interval || STATS_SETTING.interval;
        var format = '%Y-%m-%d %H:%M:%S';
        if(interval % 24 * 3600 === 0){
          format = '%Y-%m-%d';
        }else if(interval % 3600 === 0){
          format = '%Y-%m-%d %H';
        }else if(interval % 60 === 0){
          format = '%Y-%m-%d %H:%M';
        }
        var bindto = children.eq(1);
        // bindto.css('width', 80 * max + 'px');
        setTimeout(function(){
          c3.generate({
            bindto : bindto[0],
            data : data,
            // subchart : {
            //   show : true
            // },
            axis : {
              x : {
                type : 'timeseries',
                tick : {
                  format : format
                }
              }
            }
          });
        }, 0);
        
      };
    }
  };
}
chart.$inject = ['STATS_SETTING'];

})(this);