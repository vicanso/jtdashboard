_ = require 'underscore'
async = require 'async'
logger = require('../helpers/logger') __filename
module.exports = (req, res, cbf) ->
  res.header 'Cache-Control', 'no-cache, no-store'
  ua = req.header 'user-agent'
  ip = req.ip
  data = req.body
  if data
    logger.info "ip:#{ip}, ua:#{ua}, data:#{JSON.stringify(data)}"
  cbf null, {
    msg : 'success'
  }