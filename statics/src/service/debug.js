/*!
 * debug输出模块
 * @return {[type]} [description]
 */
;(function(global){
'use strict';
var module = angular.module('jt.service.debug', []);
var noop = function(){};
module.factory('debug', function(){
  var debug = window.debug;
  if(debug){
    var pattern = CONFIG && CONFIG.pattern;
    if(pattern){
      debug.enable(pattern);
    }else{
      debug.disable();
    }
    return debug;
  }else{
    return function(){
      return noop;
    };
  }
});


})(this);