

app = angular.module 'jtApp', ['LocalStorageModule', 'jt.debug', 'jt.utils', 'jt.httpLog', 'jt.user', 'jt.directive.common']
alert 'addRequires is defined' if app.addRequires

app.addRequires = (arr) ->
  arr = [arr] if !angular.isArray arr
  requires = app.requires
  angular.forEach arr, (item) ->
    requires.push item if !~requires.indexOf item
    return
  return


app.config(['localStorageServiceProvider', (localStorageServiceProvider) ->
  # localstorage的前缀
  localStorageServiceProvider.prefix = 'jt'
  return
]).config(['$httpProvider', ($httpProvider) ->
  # 所有的http请求添加http log
  $httpProvider.interceptors.push 'httpLog'
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



# app.config(function($provide){

#     $provide.decorator("$exceptionHandler", function($delegate, $injector){
#         return function(exception, cause){
#             var $rootScope = $injector.get("$rootScope");
#             $rootScope.addError({message:"Exception", reason:exception});
#             $delegate(exception, cause);
#         };
#     });

# });

app.run ['$http', ($http) ->
  timeline = window.TIME_LINE
  if timeline
    # 往服务器post timeline的时间统计
    $http.post '/timeline', timeline.getLogs()
  if window.IMPORT_FILES?.length
    # 向服务器提交当前template所使用到的静态文件（方便服务器预先做文件打包等操作）
    $http.post '/import/files', {
      template : CONFIG.template
      files : window.IMPORT_FILES
    }
  return
]
window.JT_APP = app