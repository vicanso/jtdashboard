module = angular.module 'jt.service.user', []

module.factory 'user', ['$http', '$document', 'localStorageService', 'jtUtils', ($http, $document, localStorageService, utils) ->

  # getUserLocation = utils.memoize (cbf) ->
  #   $script '//int.dpool.sina.com.cn/iplookup/iplookup.php?format=js', ->
  #     cbf null, window.remote_ip_info

  getUserInfo = utils.memoize (cbf) ->
    $http.get('/user').success((res) ->
      cbf null, res
    ).error (res) ->
      cbf res

  userInfo = localStorageService.get 'user'
  if !userInfo
    userInfo = 
      uuid : utils.uuid()
  userInfo.updatedAt = utils.now()
  localStorageService.cookie.set 'uuid', userInfo.uuid
  localStorageService.set 'user', userInfo


  user =
    getInfo : (cbf) ->
      cbf null, userInfo
      
  user

]
