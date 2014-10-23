(function() {
  var module;

  module = angular.module('jt.service.user', []);

  module.factory('user', [
    '$http', '$document', 'localStorageService', 'jtUtils', function($http, $document, localStorageService, utils) {
      var getUserInfo, user, userInfo;
      getUserInfo = utils.memoize(function(cbf) {
        return $http.get('/user').success(function(res) {
          return cbf(null, res);
        }).error(function(res) {
          return cbf(res);
        });
      });
      userInfo = localStorageService.get('user');
      if (!userInfo) {
        userInfo = {
          uuid: utils.uuid()
        };
      }
      userInfo.updatedAt = utils.now();
      localStorageService.cookie.set('uuid', userInfo.uuid);
      localStorageService.set('user', userInfo);
      user = {
        getInfo: function(cbf) {
          return cbf(null, userInfo);
        }
      };
      return user;
    }
  ]);

}).call(this);
