config = require '../config'
JTError = require '../helpers/jterror'
module.exports = (err, req, res, next) ->
  res.header 'Cache-Control', 'no-cache, no-store'
  err = new JTError err if !(err instanceof JTError)
  if 'json' == req.accepts ['html', 'json']
    data = err.toJSON()
    delete data.stack if config.env != 'development'
    res.status(err.statusCode).json data
  else
    data = err.toJSON()
    delete data.stack if config.env != 'development'
    res.render 'error', {
      viewData : data
    }