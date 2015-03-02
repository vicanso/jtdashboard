;(function(global){
'use strict';
var module = angular.module('jt.service.user', []);

module.factory('user', ['$rootScope', '$http', '$q', 'utils', 'debug', function($rootScope, $http, $q, utils, debug){
  debug = debug('user');
  var userSessionPromise;
  var userSession;
  var deferredList = [];

  var user = {
    url : '/user?cache=false',
    /**
     * [session 获取用户信息]
     * @return {[type]} [description]
     */
    session : function(){
      var deferred = $q.defer();
      if(userSession){
        deferred.resolve(userSession);
      }else if(!userSessionPromise){
        this._getSession();
        deferredList.push(deferred);
      }else{
        deferredList.push(deferred);
      }
      return deferred.promise;
    },
    _getSession : function(){
      userSessionPromise = $http.get(user.url);
      userSessionPromise.then(function(res){
        setSession(res);
      }, function(err){
        angular.forEach(deferredList, function(deferred){
          deferred.reject(err);
        });
        deferredList.length = 0;
      });
    },
    /**
     * [register 注册]
     * @param  {[type]} account  [description]
     * @param  {[type]} password [description]
     * @return {[type]}          [description]
     */
    register : function(account, password){
      var data = {
        type : 'register',
        account : account,
        password : CryptoJS.SHA1(password).toString()
      };
      return post(data);
    },
    /**
     * [login 登录]
     * @param  {[type]} account  [description]
     * @param  {[type]} password [description]
     * @return {[type]}          [description]
     */
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
    /**
     * [logout 退出登录]
     * @return {[type]} [description]
     */
    logout : function(){
      var promise = $http.delete(user.url);
      promise.then(function(res){
        userSessionPromise = null;
        setSession(res, 'logout');
      });
      return promise;
    }
  };
  return user;


  function post(data){
    var promise = $http.post(user.url, data);
    promise.then(function(res){
      userSessionPromise = null;
      setSession(res, data.type);
    });
    return promise;
  }

  function setSession(res, type){
    userSession = res.data;
    userSession.deviation = utils.now() - userSession.now;
    debug('user:%j', userSession);
    angular.forEach(deferredList, function(deferred){
      deferred.resolve(angular.copy(userSession));
    });
    deferredList.length = 0;
    if(type){
      $rootScope.$broadcast('user', type);
    }
  }

}]);

})(this);