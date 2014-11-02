_ = require 'underscore'
async = require 'async'
url = require 'url'
UserAgentParser = require 'ua-parser-js'
logger = require('../helpers/logger') __filename
JTStats = require '../helpers/stats'
module.exports = (req, res, cbf) ->
  ua = req.header 'user-agent'
  referer = req.header 'referer'
  ip = req.ip
  data = req.body
  console.dir req.cookies
  if data
    timeline = data.timeline
    view = data.view
    logger.info "ip:#{ip}, html use #{timeline.html}ms, js use #{timeline.js}ms, ua:#{ua}, referer:#{referer}, width:#{view.width}, height:#{view.height}"
    usResult = new UserAgentParser(ua).getResult()
    JTStats.count "os.#{usResult.os.name}.#{usResult.os.version}"
    JTStats.count "browser.#{usResult.browser.name}.#{usResult.browser.major}"

    width = view.width
    if width < 1000
      JTStats.count 'width.0-1000'
    else
      unitWidth = 200
      width = Math.floor(width / unitWidth) * unitWidth
      JTStats.count "width.#{width}-#{width + unitWidth}"

    if !req.cookies.JT_Dashboard
      JTStats.count 'uv'
      res.cookie 'JT_Dashboard', 'vicanso'
      

    JTStats.average 'usetime.html', timeline.html
    JTStats.average 'usetime.js', timeline.js
    urlInfo = url.parse referer
    JTStats.count 'pv'
    JTStats.count "pv.#{urlInfo.path}"
  cbf null, {
    msg : 'success'
  }