;(function(global){
'use strict';
var module = angular.module('jt.service.user', []);

module.factory('user', ['$http', '$rootScope', 'utils', 'debug', function($http, $rootScope, utils, debug){
  debug = debug('user');
  var userSessionPromise;
  var userSession;

  var user = {
    url : '/user?cache=false',
    session : function(refresh){
      if(!userSessionPromise || refresh){
        userSessionPromise = $http.get(user.url);
        userSessionPromise.then(function(res){
          setSession(res);
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
    },
    logout : function(){
      var promise = $http.delete(user.url);
      promise.then(function(res){
        userSessionPromise = null;
        setSession(res);
      });
      return promise;
    }
  };
  return user;


  function post(data){
    var promise = $http.post(user.url, data);
    promise.then(function(res){
      userSessionPromise = null;
      setSession(res);
    });
    return promise;
  }

  function setSession(res){
    userSession = res.data;
    userSession.deviation = utils.now() - userSession.now;
    debug('user:%j', userSession);
    $rootScope.$broadcast('user', userSession);
  }

}]);

})(this);