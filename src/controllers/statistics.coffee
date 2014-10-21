_ = require 'underscore'
async = require 'async'
url = require 'url'
logger = require('../helpers/logger') __filename
JTStats = require '../helpers/stats'
module.exports = (req, res, cbf) ->
  ua = req.header 'user-agent'
  referer = req.header 'referer'
  ip = req.ip
  data = req.body
  if data
    logger.info "ip:#{ip}, html use #{data.html}ms, js use #{data.js}ms, ua:#{ua}, referer:#{referer} widh:#{data.view?.width} height:#{data.view?.height}"
    JTStats.average 'usetime.html', data.html
    JTStats.average 'usetime.js'
    urlInfo = url.parse referer
    JTStats.count "pv.#{urlInfo.path}", 1
  cbf null, {
    msg : 'success'
  }