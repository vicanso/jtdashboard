JTError = require '../helpers/jterror'

module.exports = (req, res, cbf) ->
  # cbf new JTError 100
  # res.header 'Cache-Control', 'public, max-age=600'
  # res.cookie 'vicanso', Math.random() * 1000
  # res.header 'Vary', '*'
  
  cbf null, {
    name : 'vicanso'
  }