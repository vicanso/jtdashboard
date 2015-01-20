;(function(global){
'use strict';
var app = angular.module('jtApp');

app.directive('jtChart', chart);

function chart(){
  return {
    link : function(scope, element, attr){

      var generate = function(arr){
        var columns = [];
        var xs = {};
        var index = 1;
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
        c3.generate({
          bindto : element[0],
          data : {
            xs : xs,
            columns : columns,
            type: 'bar'
            // type: 'spline'
          },
          axis : {
            x : {
              type : 'timeseries',
              tick : {
                format : '%Y-%m-%d %H:%M:%S'
              }
            }
          }
        });
      };

      scope.$watch(attr.jtChart, function(v){
        if(v){
          generate(v);
        }
      });
    }
  };
}


})(this);