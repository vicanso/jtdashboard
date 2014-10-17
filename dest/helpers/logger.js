(function() {
  var Logger, appPath, colors, config, moment, path, _;

  config = require('../config');

  path = require('path');

  _ = require('underscore');

  moment = require('moment');

  if (config.env === 'development') {
    colors = require('colors');
  }

  Logger = (function() {
    function Logger(tag) {
      this.tag = tag;
    }

    Logger.prototype.log = function(msg) {
      var args;
      args = _.toArray(arguments);
      args.unshift('log');
      return this._log.apply(this, args);
    };

    Logger.prototype.info = function(msg) {
      var args;
      args = _.toArray(arguments);
      args.unshift('log');
      return this._log.apply(this, args);
    };

    Logger.prototype.debug = function(msg) {
      var args;
      args = _.toArray(arguments);
      args.unshift('debug');
      return this._log.apply(this, args);
    };

    Logger.prototype.error = function(msg) {
      var args;
      args = _.toArray(arguments);
      args.unshift('error');
      return this._log.apply(this, args);
    };

    Logger.prototype.warn = function(msg) {
      var args;
      args = _.toArray(arguments);
      args.unshift('warn');
      return this._log.apply(this, args);
    };

    Logger.prototype.write = function(msg) {};

    Logger.prototype._log = function(type, msg) {
      var data, str;
      if (config.env === 'development') {
        str = ("[" + type + "]").green;
        str += (" " + (moment().format('HH:mm:ss'))).grey;
        str += " " + (JSON.stringify(msg));
        if (this.tag) {
          str += (" [" + this.tag + "]").cyan;
        }
      } else {
        data = {
          type: type,
          msg: msg,
          createdAt: new Date().toString().green
        };
        if (this.tag) {
          data.tag = this.tag;
        }
        str = JSON.stringify(data);
      }
      if (type === 'error') {
        return console.error(str);
      } else {
        return console.info(str);
      }
    };

    return Logger;

  })();

  appPath = path.join(__dirname, '..');

  module.exports = function(file) {
    file = file.replace(appPath, '');
    return new Logger(file);
  };

}).call(this);
