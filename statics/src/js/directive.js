;(function(global){
'use strict';
var module = angular.module('jt.directive.widget', []);


module.directive('jtDialog', jtDialog);
function jtDialog($compile){
  return {
    restrict : 'E',
    // scope : {
    //   options : '=jtOptions'
    // },
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
      }
    }
  };
}

jtDialog.$inject = ['$compile'];

})(this);