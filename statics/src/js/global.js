;(function(global){

'use strict';
var requires = ['LocalStorageModule', 'jt.service.debug', 'jt.service.utils', 'jt.service.httpLog', 'jt.service.user'];
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
  var checkInterval = 10 * 1000;
  var checkWatchers = function(){
    var watchTotal = 0;
    var fn = function(element){
      if(element.data().hasOwnProperty('$scope')){
        var watchers = element.data().$scope.$$watchers;
        if(watchers){
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

function AppController($http){
  var ctrl = this;


  ctrl.login = {
    status : 'hidden'
  };




  function login(){

  }
}

AppController.$inject = ['$http']



})(this);