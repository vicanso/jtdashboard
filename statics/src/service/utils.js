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
    }
  };
  return utils;
});

})(this);