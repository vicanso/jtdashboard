mongodb = require '../helpers/mongodb'
config = require '../config'
async = require 'async'
_ = require 'underscore'
debug = require('debug') 'jt.controller.add'
module.exports = (req, res, cbf) ->
  Config = mongodb.model 'stats_config'

  async.waterfall [
    (cbf) ->
      Config.find {}, cbf
    (docs, cbf) ->
      cbf null, {
        viewData : 
          page : 'configs'
          globalVariable : 
            configs : docs
      }
  ], cbf