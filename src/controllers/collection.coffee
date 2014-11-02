mongodb = require '../helpers/mongodb'
config = require '../config'
async = require 'async'
moment = require 'moment'
_ = require 'underscore'
logger = require('../helpers/logger') __filename
debug = require('debug') 'jt.controllers'


module.exports.getKeys = (req, res, cbf) ->
  collection = req.param 'collection'

  mapOptions = 
    map : ->
      emit this.key, 1
    reduce : (k, vals) ->
      Array.sum vals

  mongodb.model(collection).mapReduce mapOptions, (err, result) ->
    if err
      cbf err
    else
      keys = _.pluck result, '_id'
      _.sortBy keys, (key) ->
        key
      debug 'keys: %j', keys
      cbf err, keys