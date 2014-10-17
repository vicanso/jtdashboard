(function() {
  var module;

  module = angular.module('jt.utils', []);

  module.factory('jtUtils', [
    '$http', '$rootScope', function($http, $rootScope) {
      var utils;
      utils = {
        now: Date.now || function() {
          return new Date().getTime();
        },
        nextTick: function(fn) {
          return setTimeout(fn, 0);
        },
        pluck: function(arr, key) {
          var result;
          result = [];
          angular.forEach(arr, function(tmp) {
            return result.push(tmp[key]);
          });
          return result;
        },
        throttle: function(func, wait, options) {
          var args, context, later, previous, result, timeout;
          context = void 0;
          args = void 0;
          result = void 0;
          timeout = null;
          previous = 0;
          if (!options) {
            options = {};
          }
          later = function() {
            previous = options.leading === false ? 0 : utils.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) {
              context = args = null;
            }
          };
          return function() {
            var now, remaining;
            now = utils.now();
            if (!previous && options.leading === false) {
              previous = now;
            }
            remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
              clearTimeout(timeout);
              timeout = null;
              previous = now;
              result = func.apply(context, args);
              if (!timeout) {
                context = args = null;
              }
            } else {
              if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
              }
            }
            return result;
          };
        },
        debounce: function(func, wait, immediate) {
          var args, context, later, result, timeout, timestamp;
          timeout = void 0;
          args = void 0;
          context = void 0;
          timestamp = void 0;
          result = void 0;
          later = function() {
            var last;
            last = utils.now() - timestamp;
            if (last < wait && last > 0) {
              timeout = setTimeout(later, wait - last);
            } else {
              timeout = null;
              if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) {
                  context = args = null;
                }
              }
            }
          };
          return function() {
            var callNow;
            context = this;
            args = arguments;
            timestamp = utils.now();
            callNow = immediate && !timeout;
            if (!timeout) {
              timeout = setTimeout(later, wait);
            }
            if (callNow) {
              result = func.apply(context, args);
              context = args = null;
            }
            return result;
          };
        },
        uuid: function() {
          var str;
          str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r, v;
            r = Math.random() * 16 | 0;
            if (c === 'x') {
              v = r;
            } else {
              v = r & 0x3 | 0x8;
            }
            return v.toString(16);
          });
          return str;
        },
        memoize: function(fn, hasher) {
          var memo, memoized, queues;
          memo = {};
          queues = {};
          hasher = hasher || function(x) {
            return x;
          };
          memoized = function() {
            var args, callback, key;
            args = Array.prototype.slice.call(arguments);
            callback = args.pop();
            key = hasher.apply(null, args);
            if (key in memo) {
              utils.nextTick(function() {
                callback.apply(null, memo[key]);
              });
            } else if (key in queues) {
              queues[key].push(callback);
            } else {
              queues[key] = [callback];
              fn.apply(null, args.concat([
                function() {
                  var i, l, q;
                  memo[key] = arguments;
                  q = queues[key];
                  delete queues[key];
                  i = 0;
                  l = q.length;
                  while (i < l) {
                    q[i].apply(null, arguments);
                    i++;
                  }
                }
              ]));
            }
          };
          memoized.memo = memo;
          memoized.unmemoized = fn;
          return memoized;
        },
        sortedIndex: function(arr, v, compare) {
          var high, low, mid;
          low = 0;
          high = (arr != null ? arr.length : void 0) || low;
          while (low < high) {
            mid = (low + high) >>> 1;
            if (compare) {
              if (compare(arr[mid], v) < 0) {
                low = mid + 1;
              } else {
                high = mid;
              }
            } else if (arr[mid] < v) {
              low = mid + 1;
            } else {
              high = mid;
            }
          }
          return low;
        }
      };
      return utils;
    }
  ]);

}).call(this);
