mongodb = require '../helpers/mongodb'
config = require '../config'
async = require 'async'
_ = require 'underscore'
debug = require('debug') 'jt.controller.readme'
module.exports = (req, res, cbf) ->
  cbf null, {
    viewData :
      page : 'readme'
  }