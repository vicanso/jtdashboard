;(function(global){
'use strict';
var module = angular.module('jt.directive.widget', []);


module.directive('jtDialog', jtDialog);
function jtDialog($compile){
  return {
    restrict : 'E',
    link : function(scope, element, attr){
      var mask;
      scope.$watch('status', function(v){
        if(v === 'hidden'){
          element.addClass('hidden');
        }else{
          showDialog();
        }
      });
      
      scope.destroy = function(){
        element.remove();
        if(mask){
          mask.remove();
        }
        scope.$destroy();
      };

      element.on('click', '.destroy', function(){
        scope.destroy();
      });

      element.on('keyup', function(e){
        if(e.keyCode === 0x0d && scope.submit){
          scope.submit();
        }
      });


      function showDialog(){
        element.removeClass('hidden');
        var width = element.outerWidth();
        var height = element.outerHeight();
        element.css({
          'margin-left' : -width / 2,
          'margin-top' : -height / 2
        });
        if(scope.modal){
          mask = angular.element('<div class="mask"></div>');
          element.after(mask);
        }
        element.find('input:first').focus();
      }
    }
  };
}

jtDialog.$inject = ['$compile'];

})(this);