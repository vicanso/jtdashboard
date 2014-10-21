mongodb = require '../helpers/mongodb'
config = require '../config'
async = require 'async'
StatsSet = mongodb.model 'stats_set'
_ = require 'underscore'
module.exports = (req, res, cbf) ->
  async.waterfall [
    (cbf) ->
      StatsSet.find {}, cbf
    (docs, cbf) ->
      # docs = _.map docs, (doc) ->
      #   doc.toObject()
      cbf null, {
        viewData :
          page : 'dashboard'
          globalVariable :
            selectedSetId : req.param 'id'
            setList : docs
      }
  ], cbf
