;(function(global){
'use strict';
var module = angular.module('jt.service.user', []);

module.factory('user', ['$http', '$q', function($http, $q){

  var userSessionDefer;


  var user = {
    url : '/user?cache=false',
    session : function(){
      if(!userSessionDefer){
        userSessionDefer = $q.defer();
        $http.get(user.url).success(userSessionDefer.resolve).error(userSessionDefer.reject);
      }
      return userSessionDefer.promise;
    },
    register : function(account, password){
      var data = {
        type : 'register',
        account : account,
        password : CryptoJS.SHA1(password).toString()
      };
      var promise = $http.post(user.url, data);
      promise.success(function(res){
        userSessionDefer.resolve(res);
        user.session().then(function(res){
          console.dir(res);
        });
        
      });
      return promise;
    }
  };
  return user;

}]);

})(this);