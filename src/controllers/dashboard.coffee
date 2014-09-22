mongodb = require '../helpers/mongodb'
config = require '../config'
module.exports = (req, res, cbf) ->

  cbf null, {
    viewData :
      page : 'home'
  }
