module = angular.module 'jt.directive.common', []

module.directive 'jtFocus', [ ->
  focusClass = 'jtFocused'
  {
    restrict : 'A'
    require : 'ngModel'
    link : (scope, element, attrs, ctrl) ->
      ctrl.$focused = false
      element.bind 'focus', (e) ->
        element.addClass focusClass
        scope.$apply ->
          ctrl.$focused = true
      element.bind 'blur', (e) ->
        element.removeClass focusClass
        scope.$apply ->
          ctrl.$focused = false
  }

]