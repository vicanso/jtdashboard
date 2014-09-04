errorConfig = require './error_config'

class JTError
  constructor : (code, statusCode = 500) ->
    msg = errorConfig[code]
    @statusCode = statusCode
    if msg
      @err = new Error msg
      @code = code
    else if code instanceof Error
      @err = code
    else
      @err = new Error code

  toJSON : ->
    {
      code : @code
      msg : @err.message
      stack : @err.stack
    }

module.exports = JTError