
/**
 * debug模块，用于开发时的log输出
 */

(function() {
  var module, noop;

  module = angular.module('jt.service.debug', []);

  noop = function() {};

  module.factory('jtDebug', [
    '$http', '$rootScope', function($http, $rootScope) {
      var debug, pattern, _ref;
      debug = window.debug;
      if (debug) {
        pattern = (_ref = window.CONFIG) != null ? _ref.pattern : void 0;
        if (pattern) {
          debug.enable(pattern);
        } else {
          debug.disable();
        }
        return debug;
      } else {
        return function() {
          return noop;
        };
      }
    }
  ]);

}).call(this);
