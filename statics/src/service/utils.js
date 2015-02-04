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
    },
    /**
     * [debounce description]
     * @param  {[type]} func      [description]
     * @param  {[type]} wait      [description]
     * @param  {[type]} immediate [description]
     * @return {[type]}           [description]
     */
    debounce : function(func, wait, immediate) {
      var timeout, args, context, timestamp, result;

      var later = function() {
          var last = utils.now() - timestamp;

          if (last < wait && last > 0) {
              timeout = setTimeout(later, wait - last);
          } else {
              timeout = null;
              if (!immediate) {
                  result = func.apply(context, args);
                  if (!timeout) context = args = null;
              }
          }
      };

      return function() {
          context = this;
          args = arguments;
          timestamp = utils.now();
          var callNow = immediate && !timeout;
          if (!timeout) timeout = setTimeout(later, wait);
          if (callNow) {
              result = func.apply(context, args);
              context = args = null;
          }

          return result;
      };
    },
    /**
     * [throttle description]
     * @param  {[type]} func    [description]
     * @param  {[type]} wait    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    throttle : function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function() {
            previous = options.leading === false ? 0 : utils.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function() {
            var now = utils.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    }
  };
  return utils;
});

})(this);