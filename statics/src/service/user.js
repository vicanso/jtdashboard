;(function(global){
'use strict';
var module = angular.module('jt.service.user', []);

module.factory('user', ['$http', function($http){

  var userSessionPromise;

  var user = {
    session : function(){
      if(!userSessionPromise){
        userSessionPromise = $http.get('/user?cache=false');
      }
      return userSessionPromise;
    }
  };
  return user;

}]);

})(this);