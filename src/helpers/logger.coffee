config = require '../config'
path = require 'path'
_ = require 'underscore'
moment = require 'moment'
colors = require 'colors' if config.env == 'development'

class Logger
  constructor : (@tag) ->
  log : (msg) ->
    args = _.toArray arguments
    args.unshift 'log'
    @_log.apply @, args
  info : (msg) ->
    args = _.toArray arguments
    args.unshift 'log'
    @_log.apply @, args

  debug : (msg) ->
    args = _.toArray arguments
    args.unshift 'debug'
    @_log.apply @, args

  error : (msg) ->
    args = _.toArray arguments
    args.unshift 'error'
    @_log.apply @, args

  warn : (msg) ->
    args = _.toArray arguments
    args.unshift 'warn'
    @_log.apply @, args

  write : (msg) ->

  _log : (type, msg) ->

    if config.env == 'development'
      str = "[#{type}]".green
      str += " #{moment().format('HH:mm:ss')}".grey
      str += " #{JSON.stringify(msg)}"
      str += " [#{@tag}]".cyan if @tag
    else
      data =
        type : type
        msg : msg
        createdAt : new Date().toString().green
      data.tag = @tag if @tag
      str = JSON.stringify data
    if type == 'error'
      console.error str
    else
      console.info str


appPath = path.join __dirname, '..'
module.exports = (file) ->
  file = file.replace appPath, ''
  return new Logger file