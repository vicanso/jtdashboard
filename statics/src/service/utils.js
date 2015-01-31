;(function(global){
'use strict';
var module = angular.module('jt.service.utils', []);

module.factory('utils', function(){
  var utils = {
    now : Date.now || function(){
      return new Date().getTime();
    },
    binaryIndexOf : function (arr, value) {
      var minIndex = 0;
      var maxIndex = arr.length - 1;
      var currentIndex;
      var currentElement;
      while(minIndex <= maxIndex){
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = arr[currentIndex];
        if(currentElement < value){
          minIndex = currentIndex + 1;
        }else if (currentElement > value) {
          maxIndex = currentIndex - 1;
        }else {
          return currentIndex;
        }
      }
      return -1;
    },
    /**
     * [getDate 获取日期格式化字符串YYYY-MM-DD]
     * @param  {[type]} dayOffset 表示当前日期前后多少天
     * @return {[type]}           [description]
     */
    getDate : function(dayOffset){
      dayOffset = dayOffset || 0;
      var offsetMs = 24 * 3600 * 1000 * dayOffset;
      var date = new Date();
      date = new Date(date.getTime() + offsetMs);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      if(month < 10){
        month = '0' + month;
      }
      var day = date.getDate();
      if(day < 10){
        day = '0' + day;
      }

      return year + '-' + month + '-' + day;

    }
  };
  return utils;
});

})(this);