;(function(global){
'use strict';
var app = angular.module('jtApp');

app.directive('jtChart', chart);

function chart(STATS_SETTING){
  return {
    link : function(scope, element, attr){
      element.html('<h3 class="title text-center"></h3><div class="chartContainer"></div>');
      var children = element.children();
      var bindto = children.eq(1);
      
      
      
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

      /**
       * [getMaxPointCount 获取图表各统计最多的是多少个点]
       * @param  {[type]} columns [description]
       * @return {[type]}         [description]
       */
      function getMaxPointCount(columns){
        var max = -1;
        angular.forEach(columns, function(column){
          max = Math.max(column.length, max);
        });
        return max;
      }

      /**
       * [prev 图表往前移]
       * @return {[type]} [description]
       */
      function prev(){
        console.dir('prev');
      }

      /**
       * [next 图表往后移]
       * @return {Function} [description]
       */
      function next(){
        console.dir('next');
      }


      function setChartPosition(){
        var chartList = d3.select(bindto[0]).selectAll('.c3-chart');
        var chartDom = angular.element(chartList[0][0]);
        console.dir(chartDom);
      }

      /**
       * [appendCtrls 插入控制图表位置的组件]
       * @return {[type]} [description]
       */
      function appendCtrls(){
        var prevHtml = '<div class="prev">' +
            '<i class="glyphicon glyphicon-chevron-left"></i>' +
          '</div>';
        var nextHtml = '<div class="next">' +
            '<i class="glyphicon glyphicon-chevron-right"></i>' +
          '</div>';
        var prevObj = angular.element(prevHtml).on('click', prev);
        var nextObj = angular.element(nextHtml).on('click', next);
        element.append(prevObj).append(nextObj);
      }

      /**
       * [repositionLegend 重新定位]
       * @return {[type]} [description]
       */
      function repositionLegend(){
        var legend = angular.element(d3.select(bindto[0]).selectAll('.c3-legend-item')[0][0]).parent();
        var legendWidth = legend[0].getBBox().width;
        var translateX = -(bindto.prop('clientWidth') - element.prop('clientWidth')) / 2;
        var legendTransform = legend.attr('transform').replace(/translate\((\d+),(\d+)\)/, 'translate(' + translateX + ',$2)');
        legend.attr('transform', legendTransform);
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

        // 设置图表的宽度
        var gap = config.gap || STATS_SETTING.gap;
        var charWidth = max * gap;
        bindto.css('width', charWidth + 'px');

        if(charWidth > element.prop('clientWidth')){
         appendCtrls();
        }

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
            },
            onrendered : function(){
              repositionLegend();
              setChartPosition(-1);
            }
          });
        }, 0);
        
      };
    }
  };
}
chart.$inject = ['STATS_SETTING'];



app.directive('jtCharts', charts);


function charts($compile, $parse){
  return {
    link : function(scope, element, attr){
      var modelName = attr.jtCharts;
      var getter = $parse(modelName);
      scope.$watch(modelName + '.status', function(status){
        switch(status){
          case 'loading':
            loading();
          break;
          case 'success':
            success();
          break;
          case 'error':
            error();
          break;
        }
      }, true);


      /**
       * [loading 显示正在加载中的状态]
       * @return {[type]} [description]
       */
      function loading(){
        element.html('正在加载中，请稍候...');
      }

      /**
       * [success 成功时将图表展示出来]
       * @param  {[type]} v [description]
       * @return {[type]}   [description]
       */
      function success(){
        var charts = getter(scope);
        var htmlArr = [];
        angular.forEach(charts.data, function(item, i){
          htmlArr.push('<div class="jtChart" jt-chart="stats.charts.data[' + i + ']"></div>')
        });
        element.html(htmlArr.join(''));
        $compile(element.children())(scope);
      }

      /**
       * [error 显示出错信息]
       * @param  {[type]} v [description]
       * @return {[type]}   [description]
       */
      function error(v){
        var charts = getter(scope);
        element.html(charts.error);
      }
    }
  };
}

charts.$inject = ['$compile', '$parse'];

})(this);