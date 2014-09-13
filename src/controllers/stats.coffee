mongodb = require '../helpers/mongodb'
config = require '../config'
async = require 'async'
moment = require 'moment'
debug = require('debug') 'jt.controller.stats'
_ = require 'underscore'
logger = require('../helpers/logger') __filename

module.exports = (req, res, cbf) ->

  query = req.query

  # TODO
  # 判断query的字段
  if !query.date
    cbf new Error 'date can not be null'
    return
  try
    query.date = JSON.parse query.date
  catch error
    cbf new error
    return

  if !query.keys
    cbf new Error 'keys can not be null'
    return
  try
    query.keys = JSON.parse query.keys
  catch error
    cbf new error
    return

  if !query.point
    cbf new Error 'point can not be null'
    return
  try
    query.point = JSON.parse query.point
  catch error
    cbf new error
    return


  interval = query.point?.interval
  if interval && interval > 0
    maxAge = Math.min interval, 1800
  maxAge = 0 if config.env == 'development'
  headerOptions = 
    'Cache-Control' : "public, max-age=#{maxAge}"

  keys = query.keys
  keys = [keys] if !_.isArray keys
  funcs = _.map keys, (key) ->
    (cbf) ->
      getStatsData query, key, cbf
  debug 'start:%j', query
  async.parallel funcs, (err, data) ->
    if err
      cbf err
    else
      data = _.flatten data, true
      debug 'finished:%j ', query
      cbf null, data, headerOptions

getStatsData = (query, key, cbf) ->
  collection = query.category
  date = query.date
  fill = query.fill == 'true'
  point = query.point
  interval = GLOBAL.parseInt point?.interval
  interval = 60 if _.isNaN interval
  # interval = 10 if interval < 10
  conditions = {}
  now = moment()

  getDate = (date) ->
    formatDate = ''
    if date
      if date == 'currentMonth'
        formatDate = now.clone().date(1).format 'YYYY-MM-DD'
      else if date.length == 10
        formatDate = date
      else
        date = GLOBAL.parseInt date
        formatDate = now.clone().add(date, 'day').format 'YYYY-MM-DD'
    else
      formatDate = now.format 'YYYY-MM-DD'
    formatDate
  if date
    conditions.date = 
      '$gte' : getDate date.start
      '$lte' : getDate date.end
  else
    conditions.date = now.format 'YYYY-MM-DD'
  debug 'conditions:%j', conditions
  if key
    value = key.value
    value = new RegExp value, 'gi' if key.type == 'reg'
    conditions.key = value
  async.waterfall [
    (cbf) ->
      mongodb.model(collection).find conditions, cbf
    (docs, cbf) ->
      docs = mergeDocs docs
      if interval < 0
        _.each docs, (doc) ->
          doc.values = [_.last doc.values]
          return
        cbf null, docs
      else if interval > 0
        cbf null, arrangePoints docs, interval, fill
      else
        cbf null, docs
  ], cbf

###*
 * [sum description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
###
sum = (data) ->
  _.reduce data, (memo, num) ->
    memo + num
  , 0
###*
 * [average description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
###
average = (data) ->
  total = sum data
  Math.round total / data.length

###*
 * [mergeDocs 将相同key的数据合并]
 * @param  {[type]} docs [description]
 * @return {[type]}      [description]
###
mergeDocs = (docs) ->
  result = {}
  _.each docs, (doc) ->
    doc = doc.toObject()
    key = doc.key
    result[key] = [] if !result[key]
    startOfSeconds = Math.floor moment(doc.date, 'YYYY-MM-DD').valueOf() / 1000
    doc.values = _.map doc.values, (value) ->
      tmp = {}
      _.each value, (v, t) ->
        tmp.t = GLOBAL.parseInt(t) + startOfSeconds
        tmp.v = v
        return
      tmp
    result[key].push doc
  _.map result, (values, key) ->
    firstItem = _.first values
    lastItem = _.last values
    obj = _.omit firstItem, ['values']
    obj.start = firstItem.date
    obj.end = lastItem.date
    tmp = _.sortBy _.flatten(_.pluck(values, 'values')), (item) ->
      item.t
    obj.values = tmp
    obj


arrangePoints = (docs, interval, fill) ->
  getArr = (start, interval, length) ->
    arr = new Array length
    for i in [0...arr.length]
      arr[i] = {
        v : []
        t : start
      }
      start += interval
    arr
  docs = _.map docs, (doc) ->
    values = doc.values
    type = doc.type
    # 根据日期计算开始到结束的时间
    start = Math.floor(moment(doc.start).valueOf() / 1000)
    oneDaySeconds = 24 * 3600
    end = Math.floor(moment(doc.end).valueOf() / 1000) + oneDaySeconds
    # 如果结束时间比当前时间还要晚，直接取当前时间
    now = Math.floor Date.now() / 1000
    end = now if end > now

    result = getArr start, interval, Math.ceil (end - start) / interval
    _.each doc.values, (data) ->
      index = Math.floor (data.t - start) / interval
      if result[index]
        result[index].v.push data.v
    result = _.map result, (data) ->
      # 如果v数组里有数据，则代表该时间段有记录
      if data.v.length
        switch type
          when 'counter' then value = sum data.v
          when 'average' then value = average data.v
          when 'gauge' then value = _.last data.v
        {
          t : data.t
          v : value
        }
      else
        # 如果参数有配置要将无记录的间隔补全，则添加记录
        if fill
          {
            t : data.t
            v : 0
          }
        else
          null
    result = _.compact result if !fill
    doc.values = result
    doc
  docs