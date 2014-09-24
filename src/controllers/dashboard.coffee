mongodb = require '../helpers/mongodb'
config = require '../config'
async = require 'async'
Set = mongodb.model 'stats_set'
_ = require 'underscore'
module.exports = (req, res, cbf) ->
  async.waterfall [
    (cbf) ->
      Set.find {}, cbf
    (docs, cbf) ->
      docs = _.map docs, (doc) ->
        doc.toObject()
      cbf null, {
        viewData :
          page : 'dashboard'
          globalVariable :
            setList : docs
      }
  ], cbf
