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
          return
        return
      element.bind 'blur', (e) ->
        element.removeClass focusClass
        scope.$apply ->
          ctrl.$focused = false
          return
        return
  }

]


module.directive 'jtSelect', ['$compile', '$parse', ($compile, $parse) ->
  {
    restrict : 'A'
    require : 'ngModel'
    template : '<i class="fa fa-plus"></i><span class="placeholder"></span><ul></ul>'
    link : (scope, element, attr) ->

      placeholder = attr.placeholder
      model = attr.ngModel
      jtSelect = attr.jtSelect


      selectedItemObj = element.find('span').text placeholder if placeholder
      multiple = attr.multiple == 'multiple'

      

      
      appendList = (items, clear) ->
        htmlArr = []
        
        # keyList = model.split '.'
        # lastKey = keyList.pop()
        # result = scope
        # angular.forEach keyList, (key) ->
        #   result = scope[key]
        #   return
        # if clear
        #   if multiple
        #     result[lastKey] = {}
        #   else
        #     result[lastKey] = ''
          
        getter = $parse model
        if clear
          if multiple
            getter.assign scope, {}
          else
            getter.assign scope, ''

        angular.forEach items, (item, i) ->
          if multiple
            ngClick = "#{model}['#{item}'] = !#{model}['#{item}']"
            ngClass = "{'fa-square' : #{model}['#{item}'], 'fa-square-o' : !#{model}['#{item}']}"
          else
            ngClick = "#{model}='#{item}'"
            ngClass = "{'fa-square' : #{model} == '#{item}', 'fa-square-o' : #{model} != '#{item}'}"
          html = '<li ng-click="' + ngClick + '">' +
            '<i class="fa" ng-class="' + ngClass + '"></i>' +
            item +
          '</li>'
          htmlArr.push html
          return
        dom = element.find('ul').html htmlArr.join ''
        $compile(dom) scope
        return

      appendList scope[jtSelect], false if scope[jtSelect]

      scope.$watch jtSelect, (newValues, oldValues) ->
        return if newValues == oldValues
        appendList newValues, !!oldValues
        return
      
      scope.$watch model, (v) ->
        return if !v
        if multiple
          values = []
          angular.forEach v, (checked, key) ->
            values.push key if checked
          if values.length
            selectedItemObj.text values.join ' '
          else
            selectedItemObj.text placeholder
        else
          if v
            selectedItemObj.text v
          else
            selectedItemObj.text placeholder
        return
      , multiple

      return
  }

]