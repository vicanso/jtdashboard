config = require '../config'
fs = require 'fs'
path = require 'path'
_ = require 'underscore'
moment = require 'moment'
componentsFile = path.join __dirname, '../components.json'

module.exports = (req, res, cbf) ->
  data = req.body
  if !data?.template
    cbf null, {
      msg : 'template不能为空'
    }
  else
    refreshComponents data.template, _.uniq _.flatten data.files
    cbf null, {}

###*
 * [refreshComponents 更新components]
 * @param  {[type]} template [description]
 * @param  {[type]} files    [description]
 * @return {[type]}          [description]
###
refreshComponents = (template, files) ->
  json = fs.readFileSync(componentsFile).toString() || '{}'
  allComponents = JSON.parse json 
  result = 
    js : []
    css : []
  url = require 'url'
  staticUrlPrefix = config.staticUrlPrefix
  _.each files, (fileUrl) ->
    urlInfo = url.parse fileUrl
    file = urlInfo.path
    file = file.substring staticUrlPrefix.length if staticUrlPrefix == file.substring 0, staticUrlPrefix.length
    ext = path.extname file
    switch ext
      when '.js' then result.js.push file
      when '.css' then result.css.push file
      else throw new Error "unexpect file:#{file}"
  components = allComponents[template]
  if !components || components.js.join('') != result.js.join('') || components.css.join('') != result.css.join('')
    result.modifiedAt = moment().format 'YYYY-MM-DD HH:mm:ss'
    allComponents[template] = result
    fs.writeFileSync componentsFile, JSON.stringify allComponents, null, 2
