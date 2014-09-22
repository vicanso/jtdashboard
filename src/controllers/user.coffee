JTError = require '../helpers/jterror'

total = 0
module.exports = (req, res, cbf) ->
  # cbf new JTError 100
  res.header 'Cache-Control', 'public, max-age=30'
  # res.cookie 'vicanso', Math.random() * 1000
  # res.header 'Vary', '*'
  res.header 'Pragma', 'nocache'
  console.dir '.......'
  if total
    res.status(500).send '{a : 1}'
    # cbf new JTError 100
    return
  total++
  cbf null, {
    name : 'vicanso'
  }