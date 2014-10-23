(function() {
  var app;

  app = angular.module('jtApp', ['LocalStorageModule', 'jt.service.debug', 'jt.service.utils', 'jt.service.httpLog', 'jt.service.stats', 'jt.service.user', 'jt.directive.common', 'jt.directive.chart', 'jt.directive.table']);

  if (app.addRequires) {
    alert('addRequires is defined');
  }

  app.addRequires = function(arr) {
    var requires;
    if (!angular.isArray(arr)) {
      arr = [arr];
    }
    requires = app.requires;
    angular.forEach(arr, function(item) {
      if (!~requires.indexOf(item)) {
        requires.push(item);
      }
    });
    return this;
  };

  app.config([
    'localStorageServiceProvider', function(localStorageServiceProvider) {
      localStorageServiceProvider.prefix = 'jt';
    }
  ]).config([
    '$httpProvider', function($httpProvider) {
      return $httpProvider.interceptors.push('jtHttpLog');
    }
  ]).config([
    '$provide', function($provide) {
      var params;
      params = [
        '$delegate', '$injector', function($delegate, $injector) {
          return function(exception, cause) {
            $delegate(exception, cause);
            if (CONFIG.env === 'development') {
              return alert("exception:" + exception + ", cause:" + cause);
            }
          };
        }
      ];
      return $provide.decorator('$exceptionHandler', params);
    }
  ]);

  app.run([
    '$http', '$timeout', function($http, $timeout) {
      var checkInterval, checkWatchers, statisticsData, timeline, _ref;
      timeline = window.TIME_LINE;
      statisticsData = {
        timeline: timeline.getLogs(),
        view: {
          width: window.screen.width,
          height: window.screen.height
        }
      };
      $http.post('/statistics', statisticsData);
      if (CONFIG.env === 'development' && ((_ref = window.IMPORT_FILES) != null ? _ref.length : void 0)) {
        $http.post('/import/files', {
          template: CONFIG.template,
          files: window.IMPORT_FILES
        });
      }
      checkInterval = 10 * 1000;
      checkWatchers = function() {
        var fn, watchers;
        watchers = [];
        fn = function(element) {
          if (element.data().hasOwnProperty('$scope')) {
            angular.forEach(element.data().$scope.$$watchers, function(watcher) {
              return watchers.push(watcher);
            });
          }
          return angular.forEach(element.children(), function(child) {
            return fn(angular.element(child));
          });
        };
        fn(angular.element(document.getElementsByTagName('body')));
        console.dir("watcher total:" + watchers.length);
        $timeout(function() {
          return checkWatchers();
        }, checkInterval);
      };
      if (CONFIG.env === 'development') {
        $timeout(function() {
          return checkWatchers();
        }, checkInterval);
      }
    }
  ]);

}).call(this);
