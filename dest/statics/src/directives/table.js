(function() {
  var module;

  module = angular.module('jt.directive.table', ['jt.service.debug', 'jt.service.stats']);

  module.directive('jtTable', [
    '$compile', '$http', 'jtDebug', 'jtStats', function($compile, $http, jtDebug, jtStats) {
      var debug, formatDate;
      debug = jtDebug('jt.table');
      formatDate = function(date, interval) {
        var day, hours, minutes, month, seconds, str, year;
        year = date.getFullYear();
        month = date.getMonth() + 1;
        if (month < 10) {
          month = "0" + month;
        }
        day = date.getDate() + 1;
        if (day < 10) {
          day = "0" + day;
        }
        str = "" + year + "-" + month + "-" + day;
        if (interval < 86400) {
          hours = date.getHours();
          if (hours < 10) {
            hours = "0" + hours;
          }
          minutes = date.getMinutes();
          if (minutes < 10) {
            minutes = "0" + minutes;
          }
          str += " " + hours + ":" + minutes;
        }
        if (interval < 60) {
          seconds = date.getSeconds();
          if (seconds < 10) {
            seconds = "0" + seconds;
          }
          str += ":" + seconds;
        }
        return str;
      };
      return {
        restrict: 'A',
        template: '<div class="jtTable"></div>',
        link: function(scope, element, attr, ctrl) {
          var config, model, show, showTable, sortData, sortOptions, subScope;
          model = attr.jtTable;
          config = scope[model];
          subScope = scope.$new();
          sortOptions = {
            index: 0,
            order: 0
          };
          subScope.sort = sortOptions;
          subScope.sortByIndex = function(index) {
            if (sortOptions.index === index) {
              sortOptions.order = ++sortOptions.order % 2;
            } else {
              sortOptions.index = index;
              sortOptions.order = 0;
            }
          };
          sortData = function(options, data) {
            var index, order;
            index = options.index;
            order = options.order;
            data.sort(function(arr1, arr2) {
              if (arr1[index] > arr2[index]) {
                if (order) {
                  return 1;
                } else {
                  return -1;
                }
              } else if (arr1[index] < arr2[index]) {
                if (order) {
                  return -1;
                } else {
                  return 1;
                }
              } else {
                return 0;
              }
            });
          };
          showTable = function(subScope) {
            var dom, html;
            html = '<div class="panel panel-default">' + '<div class="panel-heading" ng-bind="name"></div>' + '<table class="table">' + '<thead><tr>' + '<th ng-repeat="th in theadData" ng-click="sortByIndex($index)">' + '<span ng-bind="th"></span>' + '<i class="fa" ng-class="{\'fa-sort\' : sort.index != $index, \'fa-sort-desc\' : sort.index == $index && sort.order == 0, \'fa-sort-asc\' : sort.index == $index && sort.order == 1}"></i>' + '</th>' + '</tr></thead>' + '<tbody>' + '<tr ng-repeat="data in tableData">' + '<td ng-repeat="td in data track by $index" ng-bind="td || 0 "></td>' + '</tr>' + '</tbody>' + '</table>' + '</div>';
            dom = element.children('div').html(html);
            $compile(dom)(subScope);
          };
          show = function(options) {
            var obj;
            subScope.name = options.name || '未定义';
            obj = element.children('div');
            obj.html('<div style="margin:15px"><div class="alert alert-info">正在加载数据，请稍候...</div></div>');
            return jtStats.getData(options, function(err, res) {
              var dateList, interval, keyList, result, tableData, theadData, _ref;
              if (err) {
                obj.html(err.msg);
                return;
              }
              interval = ((_ref = options.point) != null ? _ref.interval : void 0) || 60;
              result = {};
              dateList = [];
              keyList = [];
              angular.forEach(res, function(statsData) {
                var key;
                key = statsData.key;
                keyList.push(key);
                return angular.forEach(statsData.values, function(tmp) {
                  var dateStr, t;
                  t = Math.floor(tmp.t / interval) * interval * 1000;
                  dateStr = formatDate(new Date(t), interval);
                  if (!result[dateStr]) {
                    dateList.push(dateStr);
                    result[dateStr] = {};
                  }
                  result[dateStr][key] = tmp.v;
                });
              });
              dateList.sort();
              theadData = ['日期'].concat(keyList);
              tableData = [];
              angular.forEach(dateList, function(date) {
                var tmpData;
                tmpData = [date];
                angular.forEach(keyList, function(key, i) {
                  tmpData[i + 1] = result[date][key];
                });
                tableData.push(tmpData);
              });
              if (sortOptions) {
                sortData(sortOptions, tableData);
              }
              subScope.theadData = theadData;
              subScope.tableData = tableData;
              showTable(subScope);
            });
          };
          scope.$watch(model, function(v) {
            if (v) {
              show(v);
            }
          });
          return subScope.$watchCollection('sort', function(v) {
            if (v && subScope.tableData) {
              sortData(v, subScope.tableData);
            }
          });
        }
      };
    }
  ]);

}).call(this);
