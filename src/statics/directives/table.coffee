module = angular.module 'jt.directive.table', ['jt.service.debug', 'jt.service.stats']

module.directive 'jtTable', ['$compile', '$http','jtDebug', 'jtStats', ($compile, $http, jtDebug, jtStats) ->
  debug = jtDebug 'jt.table'


  formatDate = (date, interval) ->
    year = date.getFullYear()
    month = date.getMonth() + 1
    month = "0#{month}" if month < 10

    day = date.getDate() + 1
    day = "0#{day}" if day < 10

    str = "#{year}-#{month}-#{day}"
    # 时间间隔小于1天
    if interval < 86400
      hours = date.getHours()
      hours = "0#{hours}" if hours < 10

      minutes = date.getMinutes()
      minutes = "0#{minutes}" if minutes < 10
      str += " #{hours}:#{minutes}"
    if interval < 60
      seconds = date.getSeconds()
      seconds = "0#{seconds}" if seconds < 10
      str += ":#{seconds}"
    str

  return {
    restrict : 'A'
    template : '<div class="jtTable"></div>'
    link : (scope, element, attr, ctrl) ->
      model = attr.jtTable
      config = scope[model]
      subScope = scope.$new()
      sortOptions = 
        index : 0
        order : 0
      subScope.sort = sortOptions
      subScope.sortByIndex = (index) ->
        if sortOptions.index == index
          sortOptions.order = ++sortOptions.order % 2
        else
          sortOptions.index = index
          sortOptions.order = 0
        return
      
      sortData = (options, data) ->
        index = options.index
        order = options.order
        data.sort (arr1, arr2) ->
          if arr1[index] > arr2[index]
            if order
              1
            else
              -1
          else if arr1[index] < arr2[index]
            if order
              -1
            else
              1
          else
            0
        return


      showTable = (subScope) ->
        html = '<div class="panel panel-default">' +
          '<div class="panel-heading" ng-bind="name"></div>' +
          '<table class="table">' +
            '<thead><tr>' +
              '<th ng-repeat="th in theadData" ng-click="sortByIndex($index)">' +
                '<span ng-bind="th"></span>' +
                '<i class="fa" ng-class="{\'fa-sort\' : sort.index != $index, \'fa-sort-desc\' : sort.index == $index && sort.order == 0, \'fa-sort-asc\' : sort.index == $index && sort.order == 1}"></i>' +
              '</th>' +
            '</tr></thead>' +
            '<tbody>' +
              '<tr ng-repeat="data in tableData">' +
                '<td ng-repeat="td in data track by $index" ng-bind="td"></td>' +
              '</tr>' +
            '</tbody>' +
          '</table>' +
        '</div>'
        dom = element.children('div').html html
        $compile(dom) subScope
        return

      show = (options) ->
        subScope.name = options.name || '未定义'
        jtStats.getData options, (err, res) ->
          if err
            console.dir error
            return
          interval = options.point?.interval || 60
          result = {}
          dateList = []
          keyList = []
          angular.forEach res, (statsData) ->
            key = statsData.key
            keyList.push key
            angular.forEach statsData.values, (tmp) ->
              t = Math.floor(tmp.t / interval) * interval * 1000
              dateStr = formatDate new Date(t), interval
              if !result[dateStr]
                dateList.push dateStr
                result[dateStr] = {} 
              result[dateStr][key] = tmp.v
              return
          dateList.sort()

          theadData = ['日期'].concat keyList
          tableData = []

          angular.forEach dateList, (date) ->
            tmpData = [date]
            angular.forEach keyList, (key, i) ->
              tmpData[i + 1] = result[date][key]
              return
            tableData.push tmpData
            return

          sortData sortOptions, tableData if sortOptions
          subScope.theadData = theadData
          subScope.tableData = tableData

          showTable subScope
          return
      scope.$watch model, (v) ->
        show v if v
        return

      subScope.$watchCollection 'sort', (v) ->
        sortData v, subScope.tableData if v && subScope.tableData
        return
  }
]