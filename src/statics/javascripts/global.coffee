

app = angular.module 'jtApp', ['LocalStorageModule', 'jt.debug', 'jt.utils', 'jt.httpLog', 'jt.user', 'jt.directive.common']
alert 'addRequires is defined' if app.addRequires

app.addRequires = (arr) ->
  arr = [arr] if !angular.isArray arr
  requires = app.requires
  angular.forEach arr, (item) ->
    requires.push item if !~requires.indexOf item
    return
  @


app.config(['localStorageServiceProvider', (localStorageServiceProvider) ->
  # localstorage的前缀
  localStorageServiceProvider.prefix = 'jt'
  return
]).config(['$httpProvider', ($httpProvider) ->
  # 所有的http请求添加http log
  $httpProvider.interceptors.push 'jtHttpLog'
]).config(['$provide', ($provide) ->
  params = [
    '$delegate', '$injector', ($delegate, $injector) ->
      (exception, cause) ->
        $delegate exception, cause
        if CONFIG.env == 'development'
          alert "exception:#{exception}, cause:#{cause}"
  ]
  $provide.decorator '$exceptionHandler', params
])


app.run ['$http', '$timeout', ($http, $timeout) ->
  timeline = window.TIME_LINE
  if timeline
    # 往服务器post timeline的时间统计
    $http.post '/timeline', timeline.getLogs()
  if CONFIG.env == 'development' && window.IMPORT_FILES?.length
    # 向服务器提交当前template所使用到的静态文件（方便服务器预先做文件打包等操作）
    $http.post '/import/files', {
      template : CONFIG.template
      files : window.IMPORT_FILES
    }


  checkInterval = 10 * 1000
  checkWatchers = ->
    watchers = []

    fn = (element) ->
      if element.data().hasOwnProperty '$scope'
        angular.forEach element.data().$scope.$$watchers, (watcher) ->
          watchers.push watcher
      angular.forEach element.children(), (child) ->
        fn angular.element child

    fn angular.element document.getElementsByTagName('body')
    

    console.dir "watcher total:#{watchers.length}"
    $timeout ->
      checkWatchers()
    , checkInterval
    return

  $timeout ->
    checkWatchers()
  , checkInterval if CONFIG.env == 'development'
  return
]
