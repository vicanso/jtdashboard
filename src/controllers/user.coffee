JTError = require '../helpers/jterror'

module.exports = (req, res, cbf) ->
  # cbf new JTError 100
  cbf null, {
    name : 'vicanso'
  }