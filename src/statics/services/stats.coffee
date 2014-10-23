module = angular.module 'jt.service.stats', ['jt.service.debug']


module.factory 'jtStats', ['$http', '$q', 'jtDebug', ($http, $q, jtDebug) ->
  debug = jtDebug 'jt.stats'

  jtStats =
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
        url = "/stats?conditions=#{JSON.stringify(statOptions)}"
        httpOptions =
          cache : true
        if options.point?.interval < 0
          url += '&cache=false'
          httpOptions.cache = false
        httpOptions.cache = false if options.refreshInterval
        
        $http.get(url, httpOptions).success((res)->
          if angular.isArray res
            angular.forEach res, (item) ->
              item.chart = statOptions.chart
              return
          else
            res.chart = statOptions.chart
          defer.resolve res
          return
        ).error (res) ->
          defer.reject res
          return
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
        return
      error = (err) ->
        debug 'getData options%j, err:%j', options, err
        cbf err
        return
      $q.all(funcs).then success, error

    ###*
     * [getKeys description]
     * @param  {[type]} category [description]
     * @param  {[type]} cbf      [description]
     * @return {[type]}          [description]
    ###
    getKeys : (category, cbf) ->
      $http.get("/collection/#{category}/keys").success((res)->
        debug 'getKeys res:%j', res
        cbf null, res
      ).error (err) ->
        debug 'getKeys err:%j', err
        cbf err


  jtStats

]