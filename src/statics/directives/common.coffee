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


module.directive 'jtSelect', ['$compile', ($compile) ->
  {
    restrict : 'A'
    require : 'ngModel'
    template : '<i class="fa fa-plus"></i><span class="placeholder"></span><ul></ul>'
    link : (scope, element, attr) ->

      placeholder = attr.placeholder
      model = attr.ngModel
      element.find('span').text placeholder if placeholder
      
      appendList = (items) ->
        htmlArr = []
        angular.forEach items, (item, i) ->
          ngClick = "#{model}='#{item}'"
          ngClass = "{'fa-square' : #{model} == '#{item}', 'fa-square-o' : #{model} != '#{item}'}"
          html = '<li ng-click="' + ngClick + '">' +
            '<i class="fa", ng-class="' + ngClass + '"></i>' +
            item +
          '</li>'
          htmlArr.push html
          return
        dom = element.find('ul').html htmlArr.join ''
        $compile(dom) scope
        return

      appendList scope[attr.jtSelect]

      scope.$watch attr.jtSelect, (newValues, oldValues) ->
        return if newValues == oldValues
        appendList newValues
        return
      
      scope.$watch model, (v) ->
        element.find('span').text v if v
        return


      return

    # link: function(scope, element, attr, ngModel) {
  }

]