mongodb = require '../helpers/mongodb'
config = require '../config'
async = require 'async'
moment = require 'moment'
_ = require 'underscore'
logger = require('../helpers/logger') __filename

module.exports = (req, res, cbf) ->
  StatsConfig = mongodb.model 'stats_config'
  method = req.method

  save = (data, cbf) ->
    async.waterfall [
      (cbf) ->
        StatsConfig.findOne {name : data.name}, cbf
      (doc, cbf) ->
        if doc
          err = new Error 'the name has exists'
          cbf err
        else
          new StatsConfig(data).save (err, doc) ->
            cbf err, doc
    ], cbf
  update = (id, data, cbf) ->
    StatsConfig.findByIdAndUpdate id, data, cbf

  get = (query, cbf) ->
    if !query
      cbf new Error 'query can not be null'
      return
    async.waterfall [
      (cbf) ->
        StatsConfig.findOne query, cbf
      (data, cbf) ->
        cbf null, data
    ], cbf
  id = req.param 'id'
  switch method
    when 'POST'
      if id
        update id, req.body, cbf
      else
        save req.body, cbf
    when 'GET'
      get req.query, cbf