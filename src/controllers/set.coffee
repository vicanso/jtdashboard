mongodb = require '../helpers/mongodb'
config = require '../config'
async = require 'async'
_ = require 'underscore'
Set = mongodb.model 'stats_set'
Config = mongodb.model 'stats_config'


get = (id, cbf) ->
  async.waterfall [
    (cbf) ->
      Set.findById id, cbf
    (doc, cbf) ->
      if !doc
        cbf new Error "can not find doc by #{id}"
        return
      doc = doc.toObject()
      ids = _.pluck doc.configs, 'id'
      fnList = _.map ids, (id) ->
        (cbf) ->
          Config.findById id, cbf
          return
      async.parallel fnList, (err, configs) ->
        cbf err, doc, configs
    (doc, configs, cbf) ->
      _.each configs, (tmp, i) ->
        doc.configs[i] = _.extend tmp.toObject(), doc.configs[i]
        return
      cbf null, doc
  ], cbf

add = (data, cbf) ->
  async.waterfall [
    (cbf) ->
      Set.findOne {name : data.name}, cbf
    (doc, cbf) ->
      if doc
        cbf new Error 'the name is exists'
      else
        new Set(data).save cbf
  ], cbf

module.exports = (req, res, cbf) ->
  switch req.method
    when 'POST' then add req.body, cbf
    else get req.param('id'), cbf
  return