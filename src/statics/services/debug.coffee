###*
 * debug模块，用于开发时的log输出
###

module = angular.module 'jt.service.debug', []
noop = ->

module.factory 'jtDebug', ['$http', '$rootScope', ($http, $rootScope) ->
  debug = window.debug
  if debug
    pattern = window.CONFIG?.pattern
    if pattern
      debug.enable pattern
    else
      debug.disable()
    debug
  else
    ->
      noop

]
