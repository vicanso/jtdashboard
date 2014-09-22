mongodb = require '../helpers/mongodb'
config = require '../config'
async = require 'async'
moment = require 'moment'
_ = require 'underscore'
logger = require('../helpers/logger') __filename

module.exports = (req, res, cbf) ->
  Config = mongodb.model 'stats_config'
  method = req.method
  console.dir method

  save = (data, cbf) ->
    async.waterfall [
      (cbf) ->
        Config.findOne {name : data.name}, cbf
      (doc, cbf) ->
        if doc
          err = new Error 'the name has exists'
          cbf err
        else
          new Config(data).save (err, doc) ->
            cbf err, doc
    ], cbf

  get = (query, cbf) ->
    console.dir query
    if !query
      cbf new Error 'query can not be null'
      return
    async.waterfall [
      (cbf) ->
        Config.findOne query, cbf
      (data, cbf) ->
        cbf null, data
    ], cbf

  switch method
    when 'POST'
      save req.body, cbf
    when 'GET'
      get req.query, cbf