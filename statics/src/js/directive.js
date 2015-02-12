;(function(global){
'use strict';
var module = angular.module('jt.directive.widget', []);


module.directive('jtDialog', jtDialog);
function jtDialog(){
  return {
    restrict : 'E',
    scope : {
      options : '=jtOptions'
    },
    link : function(scope, element, attr){
      var options = scope.options;
      var mask;
      

      var listener = scope.$watch('options.status', function(v){
        if(v === 'hidden'){
          element.addClass('hidden');
        }else{
          showDialog();
        }
      });

      console.dir(options);


      element.on('click', '.destroy', function(){
        listener();

        element.remove();
        if(mask){
          mask.remove();
        }
        scope.$destroy();
      });


      function showDialog(){
        element.removeClass('hidden');
        var width = element.outerWidth();
        var height = element.outerHeight();
        element.css({
          'margin-left' : -width / 2,
          'margin-top' : -height / 2
        });
        if(options.modal){
          mask = angular.element('<div class="mask"></div>');
          element.after(mask);
        }
      }
    }
  };
}

})(this);