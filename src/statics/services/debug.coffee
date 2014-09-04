###*
 * debug模块，用于开发时的log输出
###

module = angular.module 'jt.debug', []
noop = ->

module.factory 'debug', ['$http', '$rootScope', ($http, $rootScope) ->
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
