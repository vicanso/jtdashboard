module = angular.module 'jt.table', ['jt.utils', 'jt.debug']

module.directive 'jtTable', ['$http', '$q', 'jtUtils', 'jtDebug', ($http, $q, jtUtils, jtDebug) ->
  debug = jtDebug 'jt.table'
  jtTable =