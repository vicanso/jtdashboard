(function() {
  var module;

  module = angular.module('jt.directive.chart', ['jt.service.utils', 'jt.service.debug']);

  module.directive('jtChart', [
    '$http', '$timeout', '$q', 'jtUtils', 'jtDebug', function($http, $timeout, $q, jtUtils, jtDebug) {
      var average, convertData, daySeconds, debug, defaultOption, defaultPieOption, defaultTheme, formatTime, getDataZoom, jtChart, mergeTimeList, sum;
      debug = jtDebug('jt.chart');
      jtChart = {

        /**
         * [getChartData description]
         * @param  {[type]} options 用于配置获取的数据参数
         * category： 对应于mongodb的collection
         * 
         * date：用于配置获取的时间段，可选，若为空则取当天数据
         * {
         *   start : '开始日期（YYYY-MM-DD）或者 -1, -2表示多少天之前'
         *   end : '结束日期（YYYY-MM-DD）'
         * }
         * 
         * key：用于标记获取的记录，有以下的配置方式
         * 1、{
         *   value : 'pv'
         *   type : 'reg' //可选，若为'reg'则是正式表达式配置，否则全配置
         * }
         * 2、[
         *   {
         *     value : 'pv'
         *   }
         *   {
         *     value : 'pv.category'
         *   }
         * ]
         *
         * point：用于配置点间隔
         * {
         *   interval : 60 // 60s，尽量使用和stats收集记录的配置时间的倍数，若不传该参数，后台获取数据默认以60s为间隔
         * }
         *
         * fill：是否填充未收集到数据的间隔，true or false，默认为false
         * @param  {[type]} cbf     [description]
         * @return {[type]}         [description]
         */
        getData: function(options, cbf) {
          var baseQuery, error, funcs, success;
          baseQuery = {
            date: options.date,
            fill: options.fill,
            point: options.point
          };
          funcs = [];
          angular.forEach(options.stats, function(statOptions) {
            var defer, httpOptions, url, _ref;
            defer = $q.defer();
            statOptions = angular.extend({}, baseQuery, statOptions);
            url = "/stats?conditions=" + (JSON.stringify(statOptions));
            httpOptions = {
              cache: true
            };
            if (((_ref = options.point) != null ? _ref.interval : void 0) < 0) {
              url += '&cache=false';
              httpOptions.cache = false;
            }
            if (options.refreshInterval) {
              httpOptions.cache = false;
            }
            $http.get(url, httpOptions).success(function(res) {
              if (angular.isArray(res)) {
                angular.forEach(res, function(item) {
                  item.chart = statOptions.chart;
                });
              } else {
                res.chart = statOptions.chart;
              }
              defer.resolve(res);
            }).error(function(res) {
              defer.reject(res);
            });
            funcs.push(defer.promise);
          });
          success = function(res) {
            var result;
            debug('getData options:%j, res:%j', options, res);
            result = [];
            angular.forEach(res, function(tmp) {
              if (angular.isArray(tmp)) {
                result = result.concat(tmp);
              } else {
                result.push(tmp);
              }
            });
            cbf(null, result);
          };
          error = function(err) {
            debug('getData options%j, err:%j', options, err);
            cbf(err);
          };
          return $q.all(funcs).then(success, error);
        }
      };
      daySeconds = 24 * 3600;
      defaultOption = {
        tooltip: {
          trigger: 'axis'
        },
        calculable: true,
        toolbox: {
          show: false,
          feature: {
            mark: {
              show: false
            },
            dataView: {
              show: false
            },
            magicType: {
              show: false,
              type: ['line', 'bar']
            },
            restore: {
              show: false
            },
            saveAsImage: {
              show: true
            }
          }
        },
        yAxis: [
          {
            type: 'value'
          }
        ],
        animation: false
      };
      defaultPieOption = {
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        toolbox: {
          show: false,
          feature: {
            mark: {
              show: false
            },
            dataView: {
              show: false
            },
            restore: {
              show: false
            },
            saveAsImage: {
              show: true
            }
          },
          calculable: true
        }
      };

      /**
       * [sum description]
       * @param  {[type]} data [description]
       * @return {[type]}      [description]
       */
      sum = function(data) {
        var tmp;
        tmp = 0;
        angular.forEach(data, function(num) {
          return tmp += num;
        });
        return tmp;
      };

      /**
       * [average description]
       * @param  {[type]} data [description]
       * @return {[type]}      [description]
       */
      average = function(data) {
        var total;
        total = sum(data);
        return Math.round(total / data.length);
      };
      mergeTimeList = function(data) {
        var result, tmpArrList;
        tmpArrList = [];
        angular.forEach(data, function(item) {
          var arr;
          arr = [];
          angular.forEach(item.values, function(v) {
            return arr.push(v.t);
          });
          tmpArrList.push(arr);
        });
        result = tmpArrList.shift();
        angular.forEach(tmpArrList, function(arr) {
          angular.forEach(arr, function(time, i) {
            var index;
            index = jtUtils.sortedIndex(result, time);
            if (result[index] !== time) {
              result.splice(index, 0, time);
            }
          });
        });
        return result;
      };
      convertData = function(data, timeList) {
        var i, result, valuesList, _i, _ref;
        valuesList = [];
        angular.forEach(data, function(tmp) {
          valuesList.push(tmp.values);
        });
        result = [];
        for (i = _i = 0, _ref = valuesList.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          result.push([]);
        }
        angular.forEach(timeList, function(time) {
          angular.forEach(valuesList, function(values, i) {
            var value, _ref1;
            if (((_ref1 = values[0]) != null ? _ref1.t : void 0) === time) {
              value = values.shift();
              result[i].push(value.v);
            } else {
              result[i].push(0);
            }
          });
        });
        return result;
      };
      formatTime = function(timeList, interval) {
        var formatType, result;
        formatType = 3;
        if (interval) {
          if (interval % daySeconds === 0) {
            formatType = 0;
          } else if (interval % 3600 === 0) {
            formatType = 1;
          } else if (interval % 60 === 0) {
            formatType = 2;
          }
        }
        result = [];
        angular.forEach(timeList, function(time) {
          var date, day, hours, minutes, month, seconds, year;
          date = new Date(time * 1000);
          year = date.getFullYear();
          month = date.getMonth() + 1;
          day = date.getDate();
          hours = date.getHours();
          minutes = date.getMinutes();
          seconds = date.getSeconds();
          if (month < 10) {
            month = "0" + month;
          }
          if (day < 10) {
            day = "0" + day;
          }
          if (hours < 10) {
            hours = "0" + hours;
          }
          if (minutes < 10) {
            minutes = "0" + minutes;
          }
          if (seconds < 10) {
            seconds = "0" + seconds;
          }
          switch (formatType) {
            case 0:
              date = "" + year + "-" + month + "-" + day;
              break;
            case 1:
              date = "" + year + "-" + month + "-" + day + " " + hours;
              break;
            case 2:
              date = "" + year + "-" + month + "-" + day + " " + hours + ":" + minutes;
              break;
            case 3:
              date = "" + year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
          }
          result.push(date);
        });
        return result;
      };
      getDataZoom = function(total, onePagePoionts) {
        if (onePagePoionts == null) {
          onePagePoionts = 50;
        }
        if (total > onePagePoionts) {
          return {
            show: true,
            realtime: true,
            start: 100 - Math.floor(onePagePoionts * 100 / total),
            end: 100
          };
        } else {
          return null;
        }
      };

      /**
       * [line 折线图]
       * @param  {[type]} dom     [description]
       * @param  {[type]} data    [description]
       * @param  {[type]} options [description]
       * @return {[type]}         [description]
       */
      jtChart.line = function(dom, data, options) {
        var currentOptions, keys, myChart, series, timeList, values;
        if (!(data != null ? data.length : void 0)) {
          return;
        }
        debug('line data:%j options:%j', data, options);
        timeList = mergeTimeList(data);
        values = convertData(data, timeList);
        timeList = formatTime(timeList, options != null ? options.interval : void 0);
        series = [];
        angular.forEach(data, function(item, i) {
          series.push({
            name: item.key,
            type: item.chart,
            data: values[i]
          });
        });
        keys = [];
        angular.forEach(data, function(item) {
          keys.push(item.key);
        });
        currentOptions = angular.extend({}, defaultOption, {
          legend: {
            data: keys
          },
          dataZoom: getDataZoom(timeList.length),
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: timeList
            }
          ],
          series: series
        }, options);
        if (angular.isElement(dom)) {
          myChart = echarts.init(dom, defaultTheme);
        } else {
          myChart = dom;
        }
        myChart.setOption(currentOptions, true);
        return myChart;
      };

      /**
       * [barVertical 柱状图]
       * @type {[type]}
       */
      jtChart.barVertical = jtChart.line;

      /**
       * [stack 堆积图]
       * @param  {[type]} dom     [description]
       * @param  {[type]} data    [description]
       * @param  {[type]} options [description]
       * @return {[type]}         [description]
       */
      jtChart.stack = function(dom, data, options) {
        var currentOptions, myChart, series, timeList, values;
        if (!(data != null ? data.length : void 0)) {
          return;
        }
        timeList = mergeTimeList(data);
        values = convertData(data, timeList);
        timeList = formatTime(timeList, options != null ? options.interval : void 0);
        series = [];
        angular.forEach(data, function(item, i) {
          series.push({
            name: item.key,
            type: item.chart,
            stack: '总量',
            data: values[i]
          });
        });
        currentOptions = angular.extend({}, defaultOption, {
          legend: {
            data: jtUtils.pluck(data, 'key')
          },
          dataZoom: getDataZoom(timeList.length),
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: timeList
            }
          ],
          series: series
        }, options);
        if (angular.isElement(dom)) {
          myChart = echarts.init(dom, defaultTheme);
        } else {
          myChart = dom;
        }
        myChart.setOption(currentOptions, true);
        return myChart;
      };

      /**
       * [stackBarVertical 堆积柱状图]
       * @type {[type]}
       */
      jtChart.stackBarVertical = jtChart.stack;

      /**
       * [barHorizontal 条形图]
       * @param  {[type]} dom     [description]
       * @param  {[type]} data    [description]
       * @param  {[type]} options [description]
       * @return {[type]}         [description]
       */
      jtChart.barHorizontal = function(dom, data, options, isStack) {
        var currentOptions, myChart, series, timeList, values;
        if (isStack == null) {
          isStack = false;
        }
        if (!(data != null ? data.length : void 0)) {
          return;
        }
        timeList = mergeTimeList(data);
        values = convertData(data, timeList);
        timeList = formatTime(timeList, options != null ? options.interval : void 0);
        series = [];
        angular.forEach(data, function(item, i) {
          var tmp;
          tmp = {
            name: item.key,
            type: item.chart,
            data: values[i]
          };
          if (isStack) {
            tmp.stack = '总量';
          }
          series.push(tmp);
        });
        currentOptions = angular.extend({}, defaultOption, {
          legend: {
            data: jtUtils.pluck(data, 'key')
          },
          dataZoom: getDataZoom(timeList.length),
          xAxis: [
            {
              type: 'value',
              boundaryGap: [0, 0.01]
            }
          ],
          yAxis: [
            {
              type: 'category',
              data: timeList
            }
          ],
          series: series
        }, options);
        if (angular.isElement(dom)) {
          myChart = echarts.init(dom, defaultTheme);
        } else {
          myChart = dom;
        }
        myChart.setOption(currentOptions, true);
        return myChart;
      };

      /**
       * [stackBarHorizontal 堆积条纹图]
       * @param  {[type]} dom     [description]
       * @param  {[type]} data    [description]
       * @param  {[type]} options [description]
       * @return {[type]}         [description]
       */
      jtChart.stackBarHorizontal = function(dom, data, options) {
        return jtChart.barHorizontal(dom, data, options, true);
      };

      /**
       * [pie 饼图]
       * @param  {[type]} dom    [description]
       * @param  {[type]} data    [description]
       * @param  {[type]} options [description]
       * @return {[type]}        [description]
       */
      jtChart.pie = function(dom, data, options) {
        var myChart, result, _ref;
        result = [];
        angular.forEach(data, function(item) {
          var value, values;
          values = jtUtils.pluck(item.values, 'v');
          switch (item.type) {
            case 'counter':
              value = sum(values);
              break;
            case 'average':
              value = average(values);
              break;
            case 'gauge':
              value = values[values.length - 1] || 0;
          }
          result.push({
            name: item.key,
            value: value
          });
        });
        options = angular.extend({}, defaultPieOption, {
          legend: {
            data: jtUtils.pluck(result, 'name'),
            orient: 'vertical',
            x: 'left',
            y: '30px'
          },
          series: [
            {
              name: options != null ? (_ref = options.title) != null ? _ref.text : void 0 : void 0,
              type: 'pie',
              data: result
            }
          ],
          animation: false
        }, options);
        if (angular.isElement(dom)) {
          myChart = echarts.init(dom, defaultTheme);
        } else {
          myChart = dom;
        }
        myChart.setOption(options, true);
        return myChart;
      };
      jtChart.ring = function(dom, data, options) {
        var currentValueList, dataStyle, myChart, placeHolderStyle, result, _ref;
        dataStyle = {
          normal: {
            label: {
              show: false
            },
            labelLine: {
              show: false
            }
          }
        };
        placeHolderStyle = {
          normal: {
            color: 'rgba(0,0,0,0)',
            label: {
              show: false
            },
            labelLine: {
              show: false
            }
          },
          emphasis: {
            color: 'rgba(0,0,0,0)'
          }
        };
        result = [];
        if (data.length > 1) {
          data.length = 1;
        }
        currentValueList = [];
        angular.forEach(data, function(item) {
          var value, values, _ref;
          values = jtUtils.pluck(item.values, 'v');
          switch (item.type) {
            case 'counter':
              value = sum(values);
              break;
            case 'average':
              value = average(values);
              break;
            case 'gauge':
              value = values[values.length - 1] || 0;
          }
          currentValueList.push(value);
          result.push({
            name: options != null ? (_ref = options.title) != null ? _ref.text : void 0 : void 0,
            type: 'pie',
            clockWise: false,
            radius: ['65%', '80%'],
            itemStyle: dataStyle,
            data: [
              {
                value: value,
                name: item.key
              }, {
                value: 100 - value,
                name: 'invisible',
                itemStyle: placeHolderStyle
              }
            ]
          });
        });
        options = angular.extend({}, defaultPieOption, {
          title: {
            text: currentValueList.join(','),
            subtext: options != null ? (_ref = options.title) != null ? _ref.text : void 0 : void 0,
            x: 'center',
            y: 'center',
            itemGap: 20,
            textStyle: {
              color: 'rgba(30,144,255,0.8)',
              fontFamily: '微软雅黑',
              fontSize: 48,
              fontWeight: 'bolder'
            }
          },
          series: result,
          animation: false
        });
        if (angular.isElement(dom)) {
          myChart = echarts.init(dom, defaultTheme);
        } else {
          myChart = dom;
        }
        myChart.setOption(options, true);
        return myChart;
      };

      /**
       * [nestedPie 嵌套饼图]
       * @param  {[type]} dom     [description]
       * @param  {[type]} data    [description]
       * @param  {[type]} options [description]
       * @return {[type]}         [description]
       */
      jtChart.nestedPie = function(dom, data, options) {};

      /**
       * [gauge 仪表盘]
       * @param  {[type]} dom     [description]
       * @param  {[type]} data    [description]
       * @param  {[type]} options [description]
       * @return {[type]}         [description]
       */
      jtChart.gauge = function(dom, data, options) {
        var currentOptions, myChart, series;
        currentOptions = angular.extend({
          toolbox: {
            show: true,
            feature: {
              mark: {
                show: true
              },
              restore: {
                show: true
              },
              saveAsImage: {
                show: true
              }
            }
          }
        }, options);
        series = [];
        angular.forEach(data, function(item) {
          series.push({
            name: item.key,
            type: 'gauge',
            detail: {
              formatter: '{value}'
            },
            data: [
              {
                value: item.values[0].v
              }
            ]
          });
        });
        currentOptions.series = series;
        if (angular.isElement(dom)) {
          myChart = echarts.init(dom, defaultTheme);
        } else {
          myChart = dom;
        }
        myChart.setOption(currentOptions);
        return myChart;
      };

      /**
       * [funnel 漏斗图]
       * @param  {[type]} dom     [description]
       * @param  {[type]} data    [description]
       * @param  {[type]} options [description]
       * @return {[type]}         [description]
       */
      jtChart.funnel = function(dom, data, options) {
        var currentOptions, maxValue, myChart, result;
        result = [];
        angular.forEach(data, function(item) {
          var value, values;
          values = jtUtils.pluck(item.values, 'v');
          switch (item.type) {
            case 'counter':
              value = sum(values);
              break;
            case 'average':
              value = average(values);
              break;
            case 'gauge':
              value = values[values.length - 1] || 0;
          }
          result.push({
            name: item.key,
            value: value
          });
        });
        maxValue = 0;
        angular.forEach(result, function(item) {
          if (item.value > maxValue) {
            maxValue = item.value;
          }
        });
        angular.forEach(result, function(item) {
          item.value = Math.floor(item.value * 100 / maxValue);
        });
        currentOptions = angular.extend({
          title: options.title,
          tooltip: {
            trigger: 'item',
            formatter: "{b} : {c}%"
          },
          toolbox: {
            show: true,
            feature: {
              mark: {
                show: true
              },
              dataView: {
                show: true,
                readOnly: false
              },
              restore: {
                show: true
              },
              saveAsImage: {
                show: true
              }
            }
          },
          legend: {
            data: jtUtils.pluck(result, 'name')
          },
          calculable: true,
          series: [
            {
              type: 'funnel',
              data: result
            }
          ]
        });
        if (angular.isElement(dom)) {
          myChart = echarts.init(dom, defaultTheme);
        } else {
          myChart = dom;
        }
        myChart.setOption(currentOptions, true);
        return myChart;
      };
      defaultTheme = {
        color: ["#2ec7c9", "#b6a2de", "#5ab1ef", "#ffb980", "#d87a80", "#8d98b3", "#e5cf0d", "#97b552", "#95706d", "#dc69aa", "#07a2a4", "#9a7fd1", "#588dd5", "#f5994e", "#c05050", "#59678c", "#c9ab00", "#7eb00a", "#6f5553", "#c14089"],
        title: {
          itemGap: 8,
          textStyle: {
            fontWeight: "normal",
            color: "#008acd"
          }
        },
        legend: {
          itemGap: 8
        },
        dataRange: {
          itemWidth: 15,
          color: ["#2ec7c9", "#b6a2de"]
        },
        toolbox: {
          color: ["#1e90ff", "#1e90ff", "#1e90ff", "#1e90ff"],
          effectiveColor: "#ff4500",
          itemGap: 8
        },
        tooltip: {
          backgroundColor: "rgba(50,50,50,0.5)",
          axisPointer: {
            type: "line",
            lineStyle: {
              color: "#008acd"
            },
            crossStyle: {
              color: "#008acd"
            },
            shadowStyle: {
              color: "rgba(200,200,200,0.2)"
            }
          }
        },
        dataZoom: {
          dataBackgroundColor: "#efefff",
          fillerColor: "rgba(182,162,222,0.2)",
          handleColor: "#008acd"
        },
        grid: {
          borderColor: "#eee"
        },
        categoryAxis: {
          axisLine: {
            lineStyle: {
              color: "#008acd"
            }
          },
          splitLine: {
            lineStyle: {
              color: ["#eee"]
            }
          }
        },
        valueAxis: {
          axisLine: {
            lineStyle: {
              color: "#008acd"
            }
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ["rgba(250,250,250,0.1)", "rgba(200,200,200,0.1)"]
            }
          },
          splitLine: {
            lineStyle: {
              color: ["#eee"]
            }
          }
        },
        polar: {
          axisLine: {
            lineStyle: {
              color: "#ddd"
            }
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ["rgba(250,250,250,0.2)", "rgba(200,200,200,0.2)"]
            }
          },
          splitLine: {
            lineStyle: {
              color: "#ddd"
            }
          }
        },
        timeline: {
          lineStyle: {
            color: "#008acd"
          },
          controlStyle: {
            normal: {
              color: "#008acd"
            },
            emphasis: {
              color: "#008acd"
            }
          },
          symbol: "emptyCircle",
          symbolSize: 3
        },
        bar: {
          itemStyle: {
            normal: {
              borderRadius: 5
            },
            emphasis: {
              borderRadius: 5
            }
          }
        },
        line: {
          smooth: true,
          symbol: "emptyCircle",
          symbolSize: 3
        },
        k: {
          itemStyle: {
            normal: {
              color: "#d87a80",
              color0: "#2ec7c9",
              lineStyle: {
                width: 1,
                color: "#d87a80",
                color0: "#2ec7c9"
              }
            }
          }
        },
        scatter: {
          symbol: "circle",
          symbolSize: 4
        },
        radar: {
          symbol: "emptyCircle",
          symbolSize: 3
        },
        map: {
          itemStyle: {
            normal: {
              areaStyle: {
                color: "#ddd"
              },
              label: {
                textStyle: {
                  color: "#d87a80"
                }
              }
            },
            emphasis: {
              areaStyle: {
                color: "#fe994e"
              },
              label: {
                textStyle: {
                  color: "rgb(100,0,0)"
                }
              }
            }
          }
        },
        force: {
          itemStyle: {
            normal: {
              linkStyle: {
                strokeColor: "#1e90ff"
              }
            }
          }
        },
        chord: {
          padding: 4,
          itemStyle: {
            normal: {
              lineStyle: {
                width: 1,
                color: "rgba(128, 128, 128, 0.5)"
              },
              chordStyle: {
                lineStyle: {
                  width: 1,
                  color: "rgba(128, 128, 128, 0.5)"
                }
              }
            },
            emphasis: {
              lineStyle: {
                width: 1,
                color: "rgba(128, 128, 128, 0.5)"
              },
              chordStyle: {
                lineStyle: {
                  width: 1,
                  color: "rgba(128, 128, 128, 0.5)"
                }
              }
            }
          }
        },
        gauge: {
          startAngle: 225,
          endAngle: -45,
          axisLine: {
            show: true,
            lineStyle: {
              color: [[0.2, "#2ec7c9"], [0.8, "#5ab1ef"], [1, "#d87a80"]],
              width: 10
            }
          },
          axisTick: {
            splitNumber: 10,
            length: 15,
            lineStyle: {
              color: "auto"
            }
          },
          axisLabel: {
            textStyle: {
              color: "auto"
            }
          },
          splitLine: {
            length: 22,
            lineStyle: {
              color: "auto"
            }
          },
          pointer: {
            width: 5,
            color: "auto"
          },
          title: {
            textStyle: {
              color: "#333"
            }
          },
          detail: {
            textStyle: {
              color: "auto"
            }
          }
        },
        textStyle: {
          fontFamily: "微软雅黑, Arial, Verdana, sans-serif"
        }
      };
      return {
        restrict: 'A',
        link: function(scope, element, attr, ctrl) {
          var config, destroyed, echartObj, model, show, timeoutPromise;
          destroyed = false;
          model = attr.jtChart;
          config = scope[model];
          echartObj = null;
          timeoutPromise = null;
          show = function(options, update) {
            var refreshInterval, type;
            if (update == null) {
              update = false;
            }
            type = options.type;
            refreshInterval = options.refreshInterval;
            if (!update) {
              element.html('<div style="margin:15px"><div class="alert alert-info">正在加载数据，请稍候...</div></div>');
            }
            jtChart.getData(options, function(err, data) {
              var tmpObj, _ref;
              if (destroyed) {
                return;
              }
              if (err) {
                element.html(err.msg);
              } else if (!(data != null ? data.length : void 0)) {
                element.html('<div style="margin:15px"><div class="alert alert-danger">没有相关统计数据</div></div>');
              } else {
                if (update && echartObj) {
                  tmpObj = echartObj;
                } else {
                  element.empty();
                  tmpObj = angular.element('<div style="height:100%"></div>');
                  element.append(tmpObj);
                  tmpObj = tmpObj[0];
                }
                echartObj = jtChart[type](tmpObj, data, {
                  title: {
                    text: options.name || '未定义'
                  },
                  interval: (_ref = options.point) != null ? _ref.interval : void 0
                });
              }
              if (refreshInterval) {
                timeoutPromise = $timeout(function() {
                  return show(options, true);
                }, refreshInterval * 1000);
              }
            });
          };
          if (config) {
            show(config);
          }
          scope.$watch(model, function(v) {
            if (timeoutPromise) {
              $timeout.cancel(timeoutPromise);
            }
            if (v) {
              show(v);
            }
          });
          scope.$on('$destroy', function() {
            destroyed = true;
            element.empty();
            if (timeoutPromise) {
              return $timeout.cancel(timeoutPromise);
            }
          });
        }
      };
    }
  ]);

}).call(this);
