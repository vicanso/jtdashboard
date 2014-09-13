module = angular.module 'jt.chart', []

module.factory 'jtChart', ['$http', '$q', ($http, $q) ->

  chart =
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
        $http.get('/stats', {params : statOptions}).success((res)->
          defer.resolve res
          ).error (res) ->
          defer.reject res
        funcs.push defer.promise
        return

      success = (res) ->
      error = (err) ->
      $q.all(funcs).then success, error
      




  chart

]
