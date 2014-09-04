mongodb = require '../helpers/mongodb'
config = require '../config'
module.exports = (req, res, cbf) ->
  if config.env == 'development'
    res.header 'Cache-Control', 'no-cache, no-store'
  else
    res.header 'Cache-Control', 'public, max-age=600'

  cbf null, {
    viewData :
      page : 'home'
  }
