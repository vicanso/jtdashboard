###*
 * $http相关的数据记录（请求使用时间，出错等）
###

module = angular.module 'jt.service.httpLog', ['LocalStorageModule']

now = Date.now || ->
  new Date().getTime()
module.factory 'jtHttpLog', ['$q', '$injector', 'localStorageService', ($q, $injector, localStorageService) ->
  # 本地存储http log，定时将所有的log往服务器发送
  httpLogStorage = localStorageService.get('httpLog') || {
    success : []
    error : []
  }

  ###*
   * [postHttpLog 向服务器发送http log的数据]
   * @return {[type]} [description]
  ###
  postHttpLog = ->
    $http = $injector.get '$http'
    if httpLogStorage.success.length || httpLogStorage.error.length
      $http.post('/httplog', httpLogStorage).success((res) ->
        console.dir res
      ).error (res) ->
        console.dir res
      httpLogStorage =
        success : []
        error : []
      localStorageService.set 'httpLog', httpLogStorage

  setInterval ->
    postHttpLog()
  , 120 * 1000

  httpLog =
    request : (config) ->
      # 开始时间
      config._createdAt = now()
      config
    response : (res) ->
      config = res.config
      url = config.url
      if url != '/httplog'
        useTime = now() - config._createdAt
        httpLogStorage.success.push {
          url : url
          use : useTime
        }
        localStorageService.set 'httpLog', httpLogStorage
      res
    requestError : (rejection) ->
      $q.reject rejection

      # console.dir req.config.url
    responseError : (rejection) ->
      httpLogStorage.error.push {
        url : rejection.config.url
        status : rejection.status
      }
      localStorageService.set 'httpLog', httpLogStorage
      $q.reject rejection
  httpLog
]