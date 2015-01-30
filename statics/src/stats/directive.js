;(function(global){
'use strict';
var app = angular.module('jtApp');

app.directive('jtChart', jtChart);
function jtChart(STATS_SETTING, utils){
  return {
    restrict : 'E',
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
      
      
      
      scope.$watch(attr.jtData, function(v){
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
       * [showPage 显示第几页图表]
       * @return {[type]} [description]
       */
      function showPage(offset){
        var page = chartOptions.currentPage + offset;
        if(page === 0 || page === chartOptions.maxPage + 1){
          if(page === 0){
            chartOptions.prevBtn.addClass('hidden');
          }
          if(page === chartOptions.maxPage + 1){
            chartOptions.nextBtn.addClass('hidden');
          }
          return;
        }

        chartOptions.prevBtn.removeClass('hidden');
        chartOptions.nextBtn.removeClass('hidden');

        
        var data = getChartData(page);
        chartOptions.chart.load(data);
        chartOptions.currentPage = page;
      }

      /**
       * [appendCtrls 插入控制图表位置的组件]
       * @return {[type]} [description]
       */
      function appendCtrls(){
        var prevHtml = '<div class="prev">' +
            '<i class="glyphicon glyphicon-menu-left"></i>' +
          '</div>';
        var nextHtml = '<div class="next hidden">' +
            '<i class="glyphicon glyphicon-menu-right"></i>' +
          '</div>';
        var prevBtn = angular.element(prevHtml).on('click', function(){
          showPage(-1);
        });
        var nextBtn = angular.element(nextHtml).on('click', function(){
          showPage(1);
        });
        element.append(prevBtn).append(nextBtn);
        chartOptions.prevBtn = prevBtn;
        chartOptions.nextBtn = nextBtn;
      }

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
        // 由于key在下面都会加到数组最前，所以start最小从1开始
        var end = -(chartOptions.maxPage - page) * showPointsCount;
        var start = end - showPointsCount;
        if(end === 0){
          end = undefined;
        }
        angular.forEach(chartOptions.data, function(arr){
          var key = arr[0];
          var sliceArr = arr.slice(start, end);
          if(key !== sliceArr[0]){
            sliceArr.unshift(key);
          }
          result.push(sliceArr);
        });
        return {
          x : 'x',
          columns : result
        };
      }

      function showChart(config){
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
      }

      function showPieChart(config){
        var columns = [];
        angular.forEach(config.data, function(item){
          var v = item.values[0].v;
          columns.push([item.key, v]);
        });
        setTimeout(function(){
          chartOptions.chart = c3.generate({
            bindto : bindto[0],
            data : {
              columns : columns,
              type : 'pie'
            }
          });
        }, 0);
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
        
        if(config.type !== 'pie'){
          showChart(config);
        }else{
          showPieChart(config);
        }
        
      };
    }
  };
}
jtChart.$inject = ['STATS_SETTING', 'utils'];



app.directive('jtCharts', jtCharts);
function jtCharts($compile, $parse){
  return {
    restrict : 'E',
    link : function(scope, element, attr){
      var modelName = attr.jtData;
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
        element.html('<div class="alert alert-info"><i class="glyphicon glyphicon-time"></i>正在加载中，请稍候...</div>');
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
          var itemCss = 'col-xs-12';
          if(item.type === 'pie'){
            itemCss = 'col-xs-4';
          }
          htmlArr.push('<jt-chart class="jtChart ' + itemCss + '" jt-data="stats.charts.data[' + i + ']"></jt-chart>');
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
        element.html('<div class="alert alert-danger"><i class="glyphicon glyphicon-exclamation-sign"></i>' + charts.error + '</div>');
      }
    }
  };
}
jtCharts.$inject = ['$compile', '$parse'];

})(this);