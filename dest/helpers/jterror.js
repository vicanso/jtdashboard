(function() {
  var JTError, errorConfig;

  errorConfig = require('./error_config');

  JTError = (function() {
    function JTError(code, statusCode) {
      var msg;
      if (statusCode == null) {
        statusCode = 500;
      }
      msg = errorConfig[code];
      this.statusCode = statusCode;
      if (msg) {
        this.err = new Error(msg);
        this.code = code;
      } else if (code instanceof Error) {
        this.err = code;
      } else {
        this.err = new Error(code);
      }
    }

    JTError.prototype.toJSON = function() {
      return {
        code: this.code,
        msg: this.err.message,
        stack: this.err.stack
      };
    };

    return JTError;

  })();

  module.exports = JTError;

}).call(this);
