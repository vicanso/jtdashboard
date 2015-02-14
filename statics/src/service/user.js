;(function(global){
'use strict';
var module = angular.module('jt.service.user', []);

module.factory('user', ['$http', '$rootScope', function($http, $rootScope){

  var userSessionPromise;
  var userSession;

  var user = {
    url : '/user?cache=false',
    session : function(refresh){
      if(!userSessionPromise || refresh){
        userSessionPromise = $http.get(user.url);
        userSessionPromise.success(function(res){
          userSession = res;
          $rootScope.$broadcast('user', res);
        });
      }
      return userSessionPromise;
    },
    register : function(account, password){
      var data = {
        type : 'register',
        account : account,
        password : CryptoJS.SHA1(password).toString()
      };
      return post(data);
    },
    login : function(account, password){
      var str = CryptoJS.SHA1(password).toString();
      password = CryptoJS.SHA1(str + userSession.code).toString();
      var data = {
        type : 'login',
        account : account,
        password : password
      };
      return post(data);
    }
  };
  return user;


  function post(data){
    var promise = $http.post(user.url, data);
    promise.success(function(res){
      userSessionPromise = null;
      userSession = res;
      $rootScope.$broadcast('user', res);
    });
    return promise;
  }

}]);

})(this);