_ = require 'underscore'
async = require 'async'
logger = require('../helpers/logger') __filename
module.exports = (req, res, cbf) ->
  ua = req.header 'user-agent'
  referer = req.header 'referer'
  ip = req.ip
  data = req.body
  if data
    logger.info "ip:#{ip}, html use #{data.html}ms, js use #{data.js}ms, ua:#{ua}, referer:#{referer}"
  cbf null, {
    msg : 'success'
  }