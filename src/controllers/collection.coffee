mongodb = require '../helpers/mongodb'
config = require '../config'
async = require 'async'
moment = require 'moment'
_ = require 'underscore'
logger = require('../helpers/logger') __filename
debug = require('debug') 'controllers'


module.exports.getKeys = (req, res, cbf) ->
  maxAge = 600
  maxAge = 0 if config.env == 'development'
  headerOptions = 
    'Cache-Control' : "public, max-age=#{maxAge}"
  collection = req.param 'collection'

  mapOptions = 
    map : ->
      emit 'key', this.key
    reduce : (k, vals) ->
      {
        keys : Array.unique vals
      }

  async.waterfall [
    (cbf) ->
      mongodb.model(collection).mapReduce mapOptions, (err, result) ->
        debug result
        cbf err, result
    (result, cbf) ->
      value = result?[0]?.value
      if !value.keys
        keys = [value]
      else
        keys = _.sortBy value.keys, (key) ->
          key
      cbf null, keys, headerOptions
  ], cbf
