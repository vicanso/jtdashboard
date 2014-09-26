module = angular.module 'jt.chart', ['jt.utils', 'jt.debug']

module.directive 'jtChart', ['$http', '$q', 'jtUtils', 'jtDebug', ($http, $q, jtUtils, jtDebug) ->
  debug = jtDebug 'jt.chart'
  jtChart =
    ###*
     * [getChartData description]
     * @param  {[type]} options 用于配置获取的数据参数
     * category： 对应于mongodb的collection
     * 
     * date：用于配置获取的时间段，可选，若为空则取当天数据
     * {
     *   start : '开始日期（YYYY-MM-DD）或者 -1, -2表示多少天之前'
     *   end : '结束日期（YYYY-MM-DD）'
     * }
     * 
     * key：用于标记获取的记录，有以下的配置方式
     * 1、{
     *   value : 'pv'
     *   type : 'reg' //可选，若为'reg'则是正式表达式配置，否则全配置
     * }
     * 2、[
     *   {
     *     value : 'pv'
     *   }
     *   {
     *     value : 'pv.category'
     *   }
     * ]
     *
     * point：用于配置点间隔
     * {
     *   interval : 60 // 60s，尽量使用和stats收集记录的配置时间的倍数，若不传该参数，后台获取数据默认以60s为间隔
     * }
     *
     * fill：是否填充未收集到数据的间隔，true or false，默认为false
     * @param  {[type]} cbf     [description]
     * @return {[type]}         [description]
    ###
    getData : (options, cbf) ->

      baseQuery = 
        date : options.date
        fill : options.fill
        point : options.point

      funcs = []
      angular.forEach options.stats, (statOptions) ->
        defer = $q.defer()
        statOptions = angular.extend {}, baseQuery, statOptions
        $http.get("/stats?conditions=#{JSON.stringify(statOptions)}").success((res)->
          if angular.isArray res
            angular.forEach res, (item) ->
              item.chart = statOptions.chart
              return
          else
            res.chart = statOptions.chart
          defer.resolve res
        ).error (res) ->
          defer.reject res
        funcs.push defer.promise
        return

      success = (res) ->
        debug 'getData options:%j, res:%j', options, res
        result = []
        angular.forEach res, (tmp) ->
          if angular.isArray tmp
            result = result.concat tmp
          else
            result.push tmp
          return
        cbf null, result
      error = (err) ->
        debug 'getData options%j, err:%j', options, err
        cbf err
      $q.all(funcs).then success, error
      




  daySeconds = 24 * 3600


  defaultOption = 
    tooltip :
      trigger : 'axis'
    calculable : true
    toolbox :
      show : true
      feature :
        mark :
          show : true
        dataView : 
          show : true
        magicType : 
          show :true
          type : ['line', 'bar']
        restore : 
          show : true
        saveAsImage : 
          show : true
    yAxis : [
      {
        type : 'value'
      }
    ]
    animation : false


  defaultPieOption =
    tooltip :
      trigger : 'item'
      formatter : "{a} <br/>{b} : {c} ({d}%)"
    toolbox :
      show : true
      feature :
        mark :
          show : true
        dataView :
          show : true
        restore :
          show : true
        saveAsImage :
          show : true
      calculable : true


  ###*
   * [sum description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
  ###
  sum = (data) ->
    tmp = 0
    angular.forEach data, (num) ->
      tmp += num
    tmp
  ###*
   * [average description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
  ###
  average = (data) ->
    total = sum data
    Math.round total / data.length



  mergeTimeList = (data) -> 
    tmpArrList = []
    angular.forEach data, (item) ->
      arr = []
      angular.forEach item.values, (v) ->
        arr.push v.t
      tmpArrList.push arr
    result = tmpArrList.shift()
    angular.forEach tmpArrList, (arr) ->
      angular.forEach arr, (time, i) ->
        index = jtUtils.sortedIndex result, time
        result.splice index, 0, time if result[index] != time
        return
      return
    result
    # tmpArrList = _.map data, (item) ->
    #   _.pluck item.values, 't'
    # result = tmpArrList.shift()
    # _.each tmpArrList, (arr) ->
    #   _.each arr, (time, i) ->
    #     index = _.sortedIndex result, time
    #     if result[index] != time
    #       result.splice index, 0, time
    # result

  convertData = (data, timeList) ->
    valuesList = []
    angular.forEach data, (tmp) ->
      valuesList.push tmp.values
      return
    result = []
    for i in [0...valuesList.length]
      result.push []
    angular.forEach timeList, (time) ->
      angular.forEach valuesList, (values, i) ->
        if values[0]?.t == time
          value = values.shift()
          result[i].push value.v
        else
          result[i].push 0
        return
      return
    result

    # valuesList = _.pluck data, 'values'
    # result = []
    # for i in [0...valuesList.length]
    #   result.push []
    # _.each timeList, (time) ->
    #   _.each valuesList, (values, i) ->
    #     if values[0]?.t == time
    #       value = values.shift()
    #       result[i].push value.v
    #     else
    #       result[i].push 0
    # result
  formatTime = (timeList, interval) ->
    formatType = 3
    if interval
      if interval % daySeconds == 0
        formatType = 0
      else if interval % 3600 == 0
        formatType = 1
      else if interval % 60 == 0
        formatType = 2

    result = []
    angular.forEach timeList, (time) ->
      date = new Date time * 1000
      year = date.getFullYear()
      month = date.getMonth() + 1
      day = date.getDate()
      hours = date.getHours()
      minutes = date.getMinutes()
      seconds = date.getSeconds()
      month = "0#{month}" if month < 10
      day = "0#{day}" if day < 10
      hours = "0#{hours}" if hours < 10
      minutes = "0#{minutes}" if minutes < 10
      seconds = "0#{seconds}" if seconds < 10

      switch formatType
        when 0 then date = "#{year}-#{month}-#{day}"
        when 1 then date = "#{year}-#{month}-#{day} #{hours}"
        when 2 then date = "#{year}-#{month}-#{day} #{hours}:#{minutes}"
        when 3 then date = "#{year}-#{month}-#{day} #{hours}:#{minutes}:#{seconds}"
      result.push date
      return
    result
    # formatStr = 'YYYY-MM-DD HH:mm:ss'
    # if interval
    #   if interval % daySeconds == 0
    #     formatStr = 'YYYY-MM-DD'
    #   else if interval % 3600 == 0
    #     formatStr = 'YYYY-MM-DD HH'
    #   else if interval % 60 == 0
    #     formatStr = 'YYYY-MM-DD HH:mm'
    # _.map timeList, (time) ->
    #   moment(time * 1000).format formatStr
  getDataZoom = (total) ->
    onePagePoionts = 50
    if total > onePagePoionts
      {
        show : true
        realtime : true
        start : 100 - Math.floor onePagePoionts * 100 / total
        end : 100
      }
    else
      null

  ###*
   * [line 折线图]
   * @param  {[type]} dom     [description]
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
  ###
  jtChart.line = (dom, data, options) ->
    return if !data?.length
    debug 'line data:%j options:%j', data, options
    timeList = mergeTimeList data
    values = convertData data, timeList
    timeList = formatTime timeList, options?.interval

    series = []
    angular.forEach data, (item, i) ->
      series.push {
        name : item.key
        type : item.chart
        data : values[i]
      }
      return
    keys = []
    angular.forEach data, (item) ->
      keys.push item.key
      return
    currentOptions = angular.extend {}, defaultOption, {
      legend :
        data : keys
      dataZoom : getDataZoom timeList.length
      xAxis : [
        {
          type : 'category'
          boundaryGap : false
          data : timeList
        }
      ]
      series : series
    }, options
    myChart = echarts.init dom, defaultTheme
    myChart.setOption currentOptions, true

  ###*
   * [barVertical 柱状图]
   * @type {[type]}
  ###
  jtChart.barVertical = jtChart.line

  ###*
   * [stack 堆积图]
   * @param  {[type]} dom     [description]
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
  ###
  jtChart.stack = (dom, data, options) ->
    return if !data?.length
    timeList = mergeTimeList data
    values = convertData data, timeList
    timeList = formatTime timeList, options?.interval

    series = _.map data, (item, i) ->
      {
        name : item.key
        type : item.chart
        stack : '总量'
        data : values[i]
      }
    currentOptions = _.extend {}, defaultOption, {
      legend :
        data : _.pluck data, 'key'
      dataZoom : getDataZoom timeList.length
      xAxis : [
        {
          type : 'category'
          boundaryGap : false
          data : timeList
        }
      ]
      series : series
    }, options
    myChart = echarts.init dom, defaultTheme
    myChart.setOption currentOptions, true

  ###*
   * [stackBarVertical 堆积柱状图]
   * @type {[type]}
  ###
  jtChart.stackBarVertical = jtChart.stack


  ###*
   * [barHorizontal 条形图]
   * @param  {[type]} dom     [description]
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
  ###
  jtChart.barHorizontal = (dom, data, options, isStack = false) ->

    return if !data?.length
    timeList = mergeTimeList data
    values = convertData data, timeList
    timeList = formatTime timeList, options?.interval

    series = _.map data, (item, i) ->
      tmp =
        name : item.key
        type : item.chart
        data : values[i]
      tmp.stack = '总量' if isStack
      tmp
    currentOptions = _.extend {}, defaultOption, {
      legend :
        data : _.pluck data, 'key'
      dataZoom : getDataZoom timeList.length
      xAxis : [
        {
          type : 'value'
          boundaryGap : [0, 0.01]
        }
      ]
      yAxis : [
        {
          type : 'category'
          data : timeList
        }
      ]
      series : series
    }, options
    myChart = echarts.init dom, defaultTheme
    myChart.setOption currentOptions, true

  ###*
   * [stackBarHorizontal 堆积条纹图]
   * @param  {[type]} dom     [description]
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
  ###
  jtChart.stackBarHorizontal = (dom, data, options) ->
    jtChart.barHorizontal dom, data, options, true


  ###*
   * [pie 饼图]
   * @param  {[type]} dom    [description]
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}        [description]
  ###
  jtChart.pie = (dom, data, options) ->
    data = _.map data, (item) ->
      values = _.pluck item.values, 'v'
      switch item.type
        when 'counter' then value = sum values
        when 'average' then value = average values
        when 'gauge' then value = _.last values
      {
        name : item.key
        value : value
      }
    options = _.extend {}, defaultPieOption, {
      legend :
        data : _.pluck data, 'name'
        orient : 'vertical'
        x : 'left'
        y : '30px'
      series : [
        {
          name : options?.title?.text
          type : 'pie'
          data : data
        }
      ]
      animation : false
    }, options
    myChart = echarts.init dom, defaultTheme
    myChart.setOption options, true

  ###*
   * [nestedPie 嵌套饼图]
   * @param  {[type]} dom     [description]
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
  ###
  jtChart.nestedPie = (dom, data, options) ->

  ###*
   * [gauge 仪表盘]
   * @param  {[type]} dom     [description]
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
  ###
  jtChart.gauge = (dom, data, options) ->
    currentOptions = _.extend {
      toolbox : 
        show : true
        feature : 
          mark : 
            show : true
          restore :
            show : true
          saveAsImage :
            show : true
    }, options
    currentOptions.series = _.map data, (item) ->
      {
        name : item.key
        type : 'gauge'
        detail : 
          formatter : '{value}'
        data : [
          {
            value : item.values[0].v
          }
        ]
      }
    myChart = echarts.init dom, defaultTheme
    myChart.setOption currentOptions

  ###*
   * [funnel 漏斗图]
   * @param  {[type]} dom     [description]
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
  ###
  jtChart.funnel = (dom, data, options) ->
    data = _.map data, (item) ->
      values = _.pluck item.values, 'v'
      switch item.type
        when 'counter' then value = sum values
        when 'average' then value = average values
        when 'gauge' then value = _.last values
      {
        name : item.key
        value : value
      }
    maxValue = 0
    _.each data, (item) ->
      maxValue = item.value if item.value > maxValue
      return
    _.each data, (item) ->
      item.value = Math.floor item.value * 100 / maxValue
      return

    currentOptions = _.extend {
      title : options.title
      tooltip : 
        trigger : 'item'
        formatter: "{b} : {c}%"
      toolbox :
        show : true
        feature :
          mark :
            show : true
          dataView :
            show : true
            readOnly : false
          restore : 
            show : true
          saveAsImage :
            show : true
      legend : 
        data : _.pluck data, 'name'
      calculable : true
      series : [
        {
          type : 'funnel'
          data : data
        }
      ]
    }         

    myChart = echarts.init dom, defaultTheme
    myChart.setOption currentOptions, true

  # exports.gauge = (obj, data, option, getData) ->
    # currentOptions = _.extend {
    #   toolbox : 
    #     show : true
    #     feature : 
    #       mark : 
    #         show : true
    #       restore :
    #         show : true
    #       saveAsImage :
    #         show : true
    # }, option
    # dom = $(obj).get 0
    # currentOptions.series = _.map data, (item) ->
    #   {
    #     name : item.key
    #     type : 'gauge'
    #     detail : 
    #       formatter : '{value}'
    #     data : [
    #       {
    #         value : item.values[0].v
    #       }
    #     ]
    #   }
    # myChart = echarts.init dom, defaultTheme
    # myChart.setOption currentOptions, true
    
  #   setInterval ->
  #     getData (err, data) ->
  #       if data
  #         _.each data, (item, i) ->
  #           currentOptions.series[i].data[0].value = item.values[0].v
  #         myChart.setOption currentOptions, true
  #   , 10 * 1000 if getData

  jtChart.columnFresh = (obj, data, option, getData) ->
    currentOptions = _.extend {
      toolbox : 
        show : true
        feature : 
          mark : 
            show : true
          restore :
            show : true
          saveAsImage :
            show : true
      calculable : false
      yAxis : [
        {
          type : 'value'
        }
      ]
    }, option
    currentOptions.xAxis = [
      {
        type : 'category'
        data : _.pluck data, 'key'
      }
    ]

    data = _.map data, (item) ->
      item.values[0].v
    currentOptions.series = [
      {
        type : 'bar'
        data : data
      }
    ]
    dom = $(obj).get 0
    myChart = echarts.init dom, defaultTheme
    myChart.setOption currentOptions, true
    setInterval ->
      getData (err, data) ->
        if data
          data = _.map data, (item) ->
            item.values[0].v
          currentOptions.series[0].data = data
          myChart.setOption currentOptions, true
    , 10 * 1000 if getData

                    
                    

           






  defaultTheme =
    
    # 默认色板
    color: [
      "#2ec7c9"
      "#b6a2de"
      "#5ab1ef"
      "#ffb980"
      "#d87a80"
      "#8d98b3"
      "#e5cf0d"
      "#97b552"
      "#95706d"
      "#dc69aa"
      "#07a2a4"
      "#9a7fd1"
      "#588dd5"
      "#f5994e"
      "#c05050"
      "#59678c"
      "#c9ab00"
      "#7eb00a"
      "#6f5553"
      "#c14089"
    ]
    
    # 图表标题
    title:
      itemGap: 8
      textStyle:
        fontWeight: "normal"
        color: "#008acd" # 主标题文字颜色

    
    # 图例
    legend:
      itemGap: 8

    
    # 值域
    dataRange:
      itemWidth: 15
      
      #color:['#1e90ff','#afeeee']
      color: [
        "#2ec7c9"
        "#b6a2de"
      ]

    toolbox:
      color: [
        "#1e90ff"
        "#1e90ff"
        "#1e90ff"
        "#1e90ff"
      ]
      effectiveColor: "#ff4500"
      itemGap: 8

    
    # 提示框
    tooltip:
      backgroundColor: "rgba(50,50,50,0.5)" # 提示背景颜色，默认为透明度为0.7的黑色
      axisPointer: # 坐标轴指示器，坐标轴触发有效
        type: "line" # 默认为直线，可选为：'line' | 'shadow'
        lineStyle: # 直线指示器样式设置
          color: "#008acd"

        crossStyle:
          color: "#008acd"

        shadowStyle: # 阴影指示器样式设置
          color: "rgba(200,200,200,0.2)"

    
    # 区域缩放控制器
    dataZoom:
      dataBackgroundColor: "#efefff" # 数据背景颜色
      fillerColor: "rgba(182,162,222,0.2)" # 填充颜色
      handleColor: "#008acd" # 手柄颜色

    
    # 网格
    grid:
      borderColor: "#eee"

    
    # 类目轴
    categoryAxis:
      axisLine: # 坐标轴线
        lineStyle: # 属性lineStyle控制线条样式
          color: "#008acd"

      splitLine: # 分隔线
        lineStyle: # 属性lineStyle（详见lineStyle）控制线条样式
          color: ["#eee"]

    
    # 数值型坐标轴默认参数
    valueAxis:
      axisLine: # 坐标轴线
        lineStyle: # 属性lineStyle控制线条样式
          color: "#008acd"

      splitArea:
        show: true
        areaStyle:
          color: [
            "rgba(250,250,250,0.1)"
            "rgba(200,200,200,0.1)"
          ]

      splitLine: # 分隔线
        lineStyle: # 属性lineStyle（详见lineStyle）控制线条样式
          color: ["#eee"]

    polar:
      axisLine: # 坐标轴线
        lineStyle: # 属性lineStyle控制线条样式
          color: "#ddd"

      splitArea:
        show: true
        areaStyle:
          color: [
            "rgba(250,250,250,0.2)"
            "rgba(200,200,200,0.2)"
          ]

      splitLine:
        lineStyle:
          color: "#ddd"

    timeline:
      lineStyle:
        color: "#008acd"

      controlStyle:
        normal:
          color: "#008acd"

        emphasis:
          color: "#008acd"

      symbol: "emptyCircle"
      symbolSize: 3

    
    # 柱形图默认参数
    bar:
      itemStyle:
        normal:
          borderRadius: 5

        emphasis:
          borderRadius: 5

    
    # 折线图默认参数
    line:
      smooth: true
      symbol: "emptyCircle" # 拐点图形类型
      symbolSize: 3 # 拐点图形大小

    
    # K线图默认参数
    k:
      itemStyle:
        normal:
          color: "#d87a80" # 阳线填充颜色
          color0: "#2ec7c9" # 阴线填充颜色
          lineStyle:
            width: 1
            color: "#d87a80" # 阳线边框颜色
            color0: "#2ec7c9" # 阴线边框颜色

    
    # 散点图默认参数
    scatter:
      symbol: "circle" # 图形类型
      symbolSize: 4 # 图形大小，半宽（半径）参数，当图形为方向或菱形则总宽度为symbolSize * 2

    
    # 雷达图默认参数
    radar:
      symbol: "emptyCircle" # 图形类型
      symbolSize: 3

    
    #symbol: null,         // 拐点图形类型
    #symbolRotate : null,  // 图形旋转控制
    map:
      itemStyle:
        normal:
          areaStyle:
            color: "#ddd"

          label:
            textStyle:
              color: "#d87a80"

        emphasis: # 也是选中样式
          areaStyle:
            color: "#fe994e"

          label:
            textStyle:
              color: "rgb(100,0,0)"

    force:
      itemStyle:
        normal:
          linkStyle:
            strokeColor: "#1e90ff"

    chord:
      padding: 4
      itemStyle:
        normal:
          lineStyle:
            width: 1
            color: "rgba(128, 128, 128, 0.5)"

          chordStyle:
            lineStyle:
              width: 1
              color: "rgba(128, 128, 128, 0.5)"

        emphasis:
          lineStyle:
            width: 1
            color: "rgba(128, 128, 128, 0.5)"

          chordStyle:
            lineStyle:
              width: 1
              color: "rgba(128, 128, 128, 0.5)"

    gauge:
      startAngle: 225
      endAngle: -45
      axisLine: # 坐标轴线
        show: true # 默认显示，属性show控制显示与否
        lineStyle: # 属性lineStyle控制线条样式
          color: [
            [
              0.2
              "#2ec7c9"
            ]
            [
              0.8
              "#5ab1ef"
            ]
            [
              1
              "#d87a80"
            ]
          ]
          width: 10

      axisTick: # 坐标轴小标记
        splitNumber: 10 # 每份split细分多少段
        length: 15 # 属性length控制线长
        lineStyle: # 属性lineStyle控制线条样式
          color: "auto"

      axisLabel: # 坐标轴文本标签，详见axis.axisLabel
        textStyle: # 其余属性默认使用全局文本样式，详见TEXTSTYLE
          color: "auto"

      splitLine: # 分隔线
        length: 22 # 属性length控制线长
        lineStyle: # 属性lineStyle（详见lineStyle）控制线条样式
          color: "auto"

      pointer:
        width: 5
        color: "auto"

      title:
        textStyle: # 其余属性默认使用全局文本样式，详见TEXTSTYLE
          color: "#333"

      detail:
        textStyle: # 其余属性默认使用全局文本样式，详见TEXTSTYLE
          color: "auto"

    textStyle:
      fontFamily: "微软雅黑, Arial, Verdana, sans-serif"

  {
    restrict : 'A'
    link : (scope, element, attr, ctrl) ->
      model = attr.jtChart
      config = scope[model]
      show = (options) ->
        type = options.type
        jtChart.getData options, (err, data) ->
          if err
            element.html err.msg
          else
            jtChart[type] element[0], data, {
              title : 
                text : options.name || '未定义'
              interval : options.point?.interval
            }
      show config if config
      scope.$watch model, (v) ->
        show v if v
  }

]
