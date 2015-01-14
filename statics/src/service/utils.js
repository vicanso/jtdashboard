;(function(global){
'use strict';
var module = angular.module('jt.service.utils', []);

module.factory('utils', function(){
  utils = {
    now : Date.now || function(){
      return new Date().getTime();
    }
  };
  return utils;
});

})(this);