module = angular.module 'jt.configsPage', []


fn = ($scope, $http, $element, jtDebug) ->

  $scope.configs = JT_GLOBAL.configs

  console.dir JT_GLOBAL.configs

  $element.removeClass 'hidden'


fn.$inject = ['$scope', '$http', '$element', 'jtDebug']

JT_APP.addRequires ['jt.configsPage', 'jt.chart']
JT_APP.controller 'ConfigsPageController', fn