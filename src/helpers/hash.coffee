fs = require 'fs'
crypto = require 'crypto'
async = require 'async'
hashDict = {}


hash = (buf) ->
  shasum = crypto.createHash 'sha1'
  shasum.update buf
  shasum.digest 'hex'

exports.createSync = (file) ->
  if hashDict[file]
    return hashDict[file]
  try
    buf = fs.readFileSync file
  catch error
    return ''
  key = hash buf
  hashDict[file] = key
  key

exports.create = (file, cbf) ->
  if hashDict[file]
    GLOBAL.setImmediate ->
      cbf null, hashDict[file]
    return
  async.waterfall [
    (cbf) ->
      fs.readFile file, cbf
    (buf, cbf) ->
      key = hash buf
      hashDict[file] = key
      cbf null, key
  ], cbf
