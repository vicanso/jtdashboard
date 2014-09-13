module = angular.module 'jt.user', []

module.factory 'user', ['$http', 'localStorageService', 'jtUtils', ($http, localStorageService, utils) ->

  getUserLocation = utils.memoize (cbf) ->
    $script '//int.dpool.sina.com.cn/iplookup/iplookup.php?format=js', ->
      cbf null, window.remote_ip_info

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

  localStorageService.set 'user', userInfo

  # getUserLocation ->
  #   console.dir arguments
  user =
    getInfo : getUserInfo
      
  user

]
