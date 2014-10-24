(function() {
  var module;

  module = angular.module('jt.directive.common', []);

  module.directive('jtFocus', [
    function() {
      var focusClass;
      focusClass = 'jtFocused';
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
          ctrl.$focused = false;
          element.bind('focus', function(e) {
            element.addClass(focusClass);
            scope.$apply(function() {
              ctrl.$focused = true;
            });
          });
          return element.bind('blur', function(e) {
            element.removeClass(focusClass);
            scope.$apply(function() {
              ctrl.$focused = false;
            });
          });
        }
      };
    }
  ]);

  module.directive('jtSelect', [
    '$compile', '$parse', function($compile, $parse) {
      return {
        restrict: 'A',
        require: 'ngModel',
        template: '<i class="fa fa-plus"></i><span class="placeholder"></span><ul></ul>',
        link: function(scope, element, attr) {
          var appendList, jtSelect, model, multiple, placeholder, selectedItemObj;
          placeholder = attr.placeholder;
          model = attr.ngModel;
          jtSelect = attr.jtSelect;
          if (placeholder) {
            selectedItemObj = element.find('span').text(placeholder);
          }
          multiple = attr.multiple === 'multiple';
          appendList = function(items, clear) {
            var dom, getter, htmlArr;
            htmlArr = [];
            getter = $parse(model);
            if (clear) {
              if (multiple) {
                getter.assign(scope, {});
              } else {
                getter.assign(scope, '');
              }
            }
            angular.forEach(items, function(item, i) {
              var html, ngClass, ngClick;
              if (multiple) {
                ngClick = "" + model + "['" + item + "'] = !" + model + "['" + item + "']";
                ngClass = "{'fa-square' : " + model + "['" + item + "'], 'fa-square-o' : !" + model + "['" + item + "']}";
              } else {
                ngClick = "" + model + "='" + item + "'";
                ngClass = "{'fa-square' : " + model + " == '" + item + "', 'fa-square-o' : " + model + " != '" + item + "'}";
              }
              html = '<li ng-click="' + ngClick + '">' + '<i class="fa" ng-class="' + ngClass + '"></i>' + item + '</li>';
              htmlArr.push(html);
            });
            dom = element.find('ul').html(htmlArr.join(''));
            $compile(dom)(scope);
          };
          if (scope[jtSelect]) {
            appendList(scope[jtSelect], false);
          }
          scope.$watch(jtSelect, function(newValues, oldValues) {
            if (newValues === oldValues) {
              return;
            }
            appendList(newValues, true);
          });
          scope.$watch(model, function(v) {
            var values;
            if (!v) {
              return;
            }
            if (multiple) {
              values = [];
              angular.forEach(v, function(checked, key) {
                if (checked) {
                  return values.push(key);
                }
              });
              if (values.length) {
                selectedItemObj.text(values.join(' '));
              } else {
                selectedItemObj.text(placeholder);
              }
            } else {
              if (v) {
                selectedItemObj.text(v);
              } else {
                selectedItemObj.text(placeholder);
              }
            }
          }, multiple);
        }
      };
    }
  ]);

}).call(this);
