;(function(global){

'use strict';
var requires = ['LocalStorageModule', 'jt.service.debug', 'jt.service.utils', 'jt.service.httpLog', 'jt.directive.widget', 'jt.service.user'];
var app = angular.module('jtApp', requires);

// 用户在controller中添加require
app.addRequires = function(arr){
  if(!angular.isArray(arr)){
    arr = [arr];
  }
  var requires = app.requires;
  angular.forEach(arr, function(item){
    if(!~requires.indexOf(item)){
      requires.push(item);
    }
  });
  return this;
};


app.config(['localStorageServiceProvider', function(localStorageServiceProvider){
  // localstorage的前缀
  localStorageServiceProvider.prefix = 'jt';
}]).config(['$httpProvider', function($httpProvider){
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  $httpProvider.interceptors.push('httpLog');
}]).config(['$provide', function($provide){
  var params = ['$log', '$injector', function($log, $injector){
    return function(exception, cause){
      if(CONFIG.env === 'development'){
        alert(exception.message);
        $log.error.apply($log, arguments);
      }else{
        var $http = $injector.get('$http');
        $http.post('/exception?httplog=false', {
          message : exception.message,
          stack : exception.stack,
          cause : cause
        });
      }
    };
  }];
  $provide.decorator('$exceptionHandler', params);
}]);





app.run(['$http', '$timeout', '$window', 'debug', function($http, $timeout, $window, debug){
  TIMING.end('js');
  debug = debug('app.run');
  var statistics = function(){
    var result = angular.extend({
      timeline : TIMING.getLogs(),
      view : {
        width : $window.screen.width,
        height : $window.screen.height
      }
    }, $window.performance);
    $http.post('/statistics', result);
  };

  $window.onload = function(){
    statistics();
  };


  if(CONFIG.env !== 'development'){
    return;
  }
  var checkInterval = 5 * 1000;
  var checkWatchers = function(){
    var watchTotal = 0;
    var fn = function(element){
      if(element.data().hasOwnProperty('$scope')){
        var watchers = element.data().$scope.$$watchers;
        if(watchers && watchers.length){
          watchTotal += watchers.length;
        }
      }
      angular.forEach(element.children(), function(child){
        fn(angular.element(child));
      });
    };
    fn(angular.element(document.body));
    debug('watcher total:' + watchTotal);
    $timeout(function(){
      checkWatchers();
    }, checkInterval);
  };

  
  $timeout(function(){
    checkWatchers();
  }, checkWatchers);
}]);

app.controller('AppController', AppController);

function AppController($scope, $http, $compile, $element, user){
  var ctrl = this;


  ctrl.login = login;



  function login(){
    var obj = angular.element(angular.element('#loginDialog').html());
    var tmpScope = $scope.$new(true);
    angular.extend(tmpScope, {
      status : 'hidden',
      type : 'login',
      modal : true
    });

    // test
    tmpScope.type = 'register';
    tmpScope.account = 'vicanso';
    tmpScope.password = 'Jenny7771';

    $compile(obj)(tmpScope);
    $element.append(obj);
    tmpScope.status = 'show';
    tmpScope.submit = function(){
      submit(tmpScope);
    };
  }

  function submit(tmpScope){
    if(tmpScope.type === 'register'){
      user.register(tmpScope.account, tmpScope.password).success(function(){
        tmpScope.destroy();
      }).error(function(res){
        tmpScope.error = res.msg || res.error || '未知异常';
      });
    }
  }

  // setTimeout(function(){
  //   $scope.$apply(function(){
  //     login();
  //     setTimeout(function(){
  //       $('.dialog .btn-primary').click();        
  //     }, 2000);
  //   });
  // }, 1000);
}

AppController.$inject = ['$scope', '$http', '$compile', '$element', 'user']



})(this);