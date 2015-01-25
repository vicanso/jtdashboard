;(function(global){
'use strict';
var app = angular.module('jtApp');

app.directive('jtChart', jtChart);

function jtChart(STATS_SETTING, utils){
  return {
    link : function(scope, element, attr){
      element.html('<h3 class="title text-center"></h3><div class="chartContainer"></div>');
      var children = element.children();
      var bindto = children.eq(1);
      var chartOptions = {
        // 图表的数据
        data : null,
        // 图表中每个点的间隔
        gap : null,
        // 保存c3返回的chart对象
        chart : null,
        maxPage : null,
        // 图表中一次显示的点的数量
        showPointsCount : null

      };
      
      
      
      scope.$watch(attr.jtChart, function(v){
        if(v){
          generate(v);
        }
      }, true);

      /**
       * [getTimeseries 获取时间轴数据]
       * @param  {[type]} arr [description]
       * @return {[type]}     [description]
       */
      function getTimeseries(arr){
        var timeseries = [];
        angular.forEach(arr, function(data){
          angular.forEach(data.values, function(tmp){
            timeseries.push(tmp.t);
          });
        });
        timeseries.sort();
        var current = -1;
        var result = [];
        angular.forEach(timeseries, function(time){
          if(time !== current){
            result.push(time);
            current = time;
          }
        });
        return result
      }

      /**
       * [getData 获取c3使用的数据]
       * @param  {[type]} arr [description]
       * @return {[type]}     [description]
       */
      function getData(arr){
        var tmpTimeseries = getTimeseries(arr);
        var columns = [];
        angular.forEach(arr, function(data){
          var columnData = [];
          angular.forEach(data.values, function(tmp){
            var index = utils.binaryIndexOf(tmpTimeseries, tmp.t);
            if(index !== -1){
              columnData[index] = tmp.v;
            }
          });
          columnData.unshift(data.key);
          columns.push(columnData);
        });
        var timeseries = ['x'];
        angular.forEach(tmpTimeseries, function(t){
          timeseries.push(t * 1000);
        });
        columns.unshift(timeseries);
        return columns;
      }

      /**
       * [prev 图表往前移]
       * @return {[type]} [description]
       */
      function prev(){
        var page = chartOptions.currentPage - 1;
        if(page === 0){
          return;
        }
        
        var data = getChartData(page);
        chartOptions.chart.load(data);
        chartOptions.currentPage = page;
        // var pointsCount = getPageShowPointsCount(gap);
        // var max = chartData[0].length;
        // var data = getChartData(max - 2 * pointsCount, max - pointsCount);
        // chart.load(data);
      }

      /**
       * [next 图表往后移]
       * @return {Function} [description]
       */
      function next(){
        console.dir('next');
      }


      // function setChartPosition(){
      //   var axis = angular.element(d3.select(bindto[0]).selectAll('.c3-axis.c3-axis-y')[0][0]);
      //   console.dir(axis);
      //   // var chartList = d3.select(bindto[0]).selectAll('.c3-chart');
      //   // var chartObj = angular.element(chartList[0][0]);
      //   var elementWidth = element.prop('clientWidth');
      //   var bindtoWidth = bindto.prop('clientWidth');
      //   var translateX = elementWidth - bindtoWidth;
      //   bindto.css('transform', 'translateX(' + translateX + 'px)');
      //   axis.css('transform', 'translateX(' + (-translateX) + 'px)');
      //   // chartObj.attr('transform', 'translate(' + translateX + ', 0)');
      //   // console.dir(chartList);
      //   // var transform = chartObj.attr('transform').replace(/translate\((\d+),(\d+)\)/, 'translate(' + translateX + ',$2)');
      //   // console.dir(chartDom);
      // }

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

      // /**
      //  * [repositionLegend 重新定位]
      //  * @return {[type]} [description]
      //  */
      // function repositionLegend(){
      //   var legend = angular.element(d3.select(bindto[0]).selectAll('.c3-legend-item')[0][0]).parent();
      //   var legendWidth = legend[0].getBBox().width;
      //   var translateX = -(bindto.prop('clientWidth') - element.prop('clientWidth')) / 2;
      //   var legendTransform = legend.attr('transform').replace(/translate\((\d+),(\d+)\)/, 'translate(' + translateX + ',$2)');
      //   legend.attr('transform', legendTransform);
      // }

      /**
       * [getShowPointsCount 获取图表一页能显示的点总数]
       * @param  {[type]} gap [description]
       * @return {[type]}     [description]
       */
      function getShowPointsCount(gap){
        return Math.floor(element.prop('clientWidth') / gap);
      }

      /**
       * [getChartData 获取chart显示的数据]
       * @param  {[type]} page [description]
       * @return {[type]}       [description]
       */
      function getChartData(page){
        var result = [];
        var showPointsCount = chartOptions.showPointsCount;
        var start = Math.max(0, (page - 1) * showPointsCount);
        var end = start + showPointsCount;
        angular.forEach(chartOptions.data, function(arr){
          result.push([arr[0]].concat(arr.slice(start, end)));
        });
        return {
          x : 'x',
          columns : result
        };
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
        chartOptions.data = getData(config.data);
        chartOptions.gap = config.gap || STATS_SETTING.gap;
        chartOptions.showPointsCount = getShowPointsCount(chartOptions.gap);
        var max = chartOptions.data[0].length;
        chartOptions.maxPage = Math.ceil(max / chartOptions.showPointsCount);
        chartOptions.currentPage = chartOptions.maxPage;


        var data = getChartData(chartOptions.maxPage);
        data.type = config.type;
        var interval = config.interval || STATS_SETTING.interval;

        if(max > chartOptions.showPointsCount){
          appendCtrls();
        }


        var format = '%Y-%m-%d %H:%M:%S';
        if(interval % 24 * 3600 === 0){
          format = '%Y-%m-%d';
        }else if(interval % 3600 === 0){
          format = '%Y-%m-%d %H';
        }else if(interval % 60 === 0){
          format = '%Y-%m-%d %H:%M';
        }
        setTimeout(function(){
          chartOptions.chart = c3.generate({
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
              // repositionLegend();
              // setChartPosition(-1);
            }
          });
        }, 0);
        
      };
    }
  };
}
jtChart.$inject = ['STATS_SETTING', 'utils'];



app.directive('jtCharts', jtCharts);


function jtCharts($compile, $parse){
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

jtCharts.$inject = ['$compile', '$parse'];

})(this);