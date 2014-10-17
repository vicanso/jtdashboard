(function() {
  var fn, module;

  module = angular.module('jt.dashboardPage', []);

  module.factory('jtSet', [
    '$http', 'jtDebug', function($http, jtDebug) {
      var debug, set;
      debug = jtDebug('jt.jtSet');
      set = {
        get: function(id, cbf) {
          return $http.get("/set/" + id, {
            cache: true
          }).success(function(res) {
            return cbf(null, res);
          }).error(function(err) {
            return cbf(err);
          });
        }
      };
      return set;
    }
  ]);

  fn = function($scope, $http, jtDebug, $log, user, jtSet) {
    var debug;
    debug = jtDebug('jt.dashboardPage');
    debug('start');
    $scope.setList = JT_GLOBAL.setList;
    $scope.chartType = '';
    $scope.selectedSetList = [];
    $scope.add = function(index) {
      var set;
      set = $scope.setList[index];
      index = $scope.selectedSetList.indexOf(set);
      if (!~index) {
        $scope.show(set);
        $scope.selectedSetList.push(set);
      }
    };
    $scope.remove = function(set) {
      var index;
      index = $scope.selectedSetList.indexOf(set);
      if (~index) {
        $scope.selectedSetList.splice(index, 1);
      }
    };
    $scope.show = function(set) {
      if (set.selected) {
        return;
      }
      angular.forEach($scope.selectedSetList, function(tmp) {
        tmp.selected = false;
      });
      set.selected = true;
      jtSet.get(set._id, function(err, data) {
        var _ref;
        if (data != null ? (_ref = data.configs) != null ? _ref.length : void 0 : void 0) {
          $scope.configs = data.configs;
        }
      });
    };
  };

  fn.$inject = ['$scope', '$http', 'jtDebug', '$log', 'user', 'jtSet'];

  angular.module('jtApp').addRequires(['jt.dashboardPage', 'jt.chart']).controller('DashboardController', fn);

}).call(this);
