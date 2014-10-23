(function() {
  var fn, module;

  module = angular.module('jt.configsPage', []);

  fn = function($scope, $http, $element, jtDebug) {
    var debug, previewContainer, previewContent, showChart, showStats;
    debug = jtDebug('jt.configsPage');
    debug("configs:%j", JT_GLOBAL.configs);
    previewContainer = null;
    previewContent = null;
    angular.forEach($element.children(), function(dom) {
      var obj;
      obj = angular.element(dom);
      if (obj.hasClass('previewContainer')) {
        previewContainer = obj;
        angular.forEach(obj.children(), function(dom) {
          if (angular.element(dom).hasClass('content')) {
            previewContent = angular.element(dom);
          }
        });
      }
    });
    $scope.configs = JT_GLOBAL.configs;
    $scope.sets = JT_GLOBAL.sets;
    $scope.error = {};
    $scope.success = {};
    $scope.preview = {};
    $scope.selectedItems = [];
    $scope.selectedTotal = 0;
    $element.removeClass('hidden');
    $scope.set = {};
    $scope.showType = 'config';
    showChart = function(item) {
      var options;
      $scope.error.preview = '';
      options = angular.copy(item);
      delete options.$$hashKey;
      delete options._id;
      $scope.statsOptions = options;
      previewContainer.removeClass('hidden');
    };
    showStats = function(item) {
      var str, tmpObj;
      str = angular.toJson(item.stats, true);
      tmpObj = angular.element('<pre class="code"><code>' + str + '</code></pre>');
      previewContent.empty();
      previewContent.append(tmpObj);
      previewContainer.removeClass('hidden');
    };
    $scope.closePreview = function() {
      previewContainer.addClass('hidden');
    };
    $scope.preview = function(item, type) {
      $scope.preview.type = type;
      switch (type) {
        case 'stats':
          showStats(item);
          break;
        default:
          showChart(item);
      }
    };
    $scope.toggleSelected = function(item) {
      var index;
      if (item.selected) {
        index = $scope.selectedItems.indexOf(item);
        $scope.selectedItems.splice(index, 1);
      } else {
        item.area = 1;
        $scope.selectedItems.push(item);
      }
      item.selected = !item.selected;
    };
    $scope.edit = function(setConfig) {
      var findConfig;
      findConfig = function(id) {
        var result;
        result = null;
        angular.forEach($scope.configs, function(config) {
          if (config._id === id) {
            result = config;
          }
        });
        return result;
      };
      angular.forEach($scope.selectedItems, function(tmp) {
        tmp.selected = false;
      });
      $scope.selectedItems = [];
      angular.forEach(setConfig.configs, function(config) {
        var tmp;
        tmp = findConfig(config.id);
        tmp.area = config.area;
        tmp.selected = true;
        $scope.selectedItems.push(tmp);
      });
      $scope.set.name = setConfig.name;
      $scope.set.id = setConfig._id;
    };
    $scope.save = function() {
      var configs, data, id, url;
      if (!$scope.set.name) {
        return;
      }
      data = {
        name: $scope.set.name
      };
      configs = [];
      angular.forEach($scope.selectedItems, function(item) {
        return configs.push({
          id: item._id,
          area: item.area
        });
      });
      data.configs = configs;
      url = '/set';
      id = $scope.set.id;
      if (id) {
        url += "/" + id;
      }
      $http.post(url, data).then(function(res) {
        $scope.error.save = '';
        $scope.success.save = '已成功保存该配置';
      }, function(res) {
        $scope.success.save = '';
        $scope.error.save = '保存不成功';
      });
    };
  };

  fn.$inject = ['$scope', '$http', '$element', 'jtDebug'];

  angular.module('jtApp').addRequires(['jt.configsPage']).controller('ConfigsPageController', fn);

}).call(this);
