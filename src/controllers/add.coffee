mongodb = require '../helpers/mongodb'
config = require '../config'
async = require 'async'
_ = require 'underscore'
StatsConfig = mongodb.model 'stats_config'
debug = require('debug') 'jt.controller.add'
module.exports = (req, res, cbf) ->
  options = 
    collections : (cbf) ->
      mongodb.getCollectionNames cbf
  id = req.param 'id'
  if id
    options.config = (cbf) ->
      StatsConfig.findById id, cbf
  async.parallel options, (err, result) ->
    if err
      debug 'err: %s', err.stack
      cbf err
    else
      collections = _.filter result.collections, (collection) ->
        !~collection.indexOf 'stats_'
      debug 'collections: %j', collections
      chartTypes = [
        {
          name : '折线图'
          type : 'line'
        }
        {
          name : '堆积折线图'
          type : 'stack'
        }
        {
          name : '柱状图'
          type : 'barVertical'
        }
        {
          name : '条形图'
          type : 'barHorizontal'
        }
        {
          name : '堆积柱状图'
          type : 'stackBarVertical'
        }
        {
          name : '堆积条形图'
          type : 'stackBarHorizontal'
        }
        {
          name : '环形图'
          type : 'ring'
        }
        {
          name : '标准饼图'
          type : 'pie'
        }
        {
          name : '嵌套饼图'
          type : 'nestedPie'
        }
        {
          name : '仪表盘'
          type : 'gauge'
        }
        # {
        #   name : '多仪表盘'
        #   type : 'multiGauge'
        # }
        {
          name : '漏斗图'
          type : 'funnel'
        }
        # {
        #   name : '多漏斗图'
        #   type : 'multiFunnel'
        # }
        {
          name : '表格'
          type : 'table'
        }
      ]
      cbf null, {
        viewData :
          page : 'add'
          globalVariable :
            collections : collections
            chartTypes : chartTypes
            config : result.config
            
      }