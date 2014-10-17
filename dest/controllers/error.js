(function() {
  var JTError, config;

  config = require('../config');

  JTError = require('../helpers/jterror');

  module.exports = function(err, req, res, next) {
    var data;
    res.header('Cache-Control', 'no-cache, no-store');
    if (!(err instanceof JTError)) {
      err = new JTError(err);
    }
    if ('json' === req.accepts(['html', 'json'])) {
      data = err.toJSON();
      if (config.env !== 'development') {
        delete data.stack;
      }
      return res.status(err.statusCode).json(data);
    } else {
      data = err.toJSON();
      if (config.env !== 'development') {
        delete data.stack;
      }
      return res.render('error', {
        viewData: data
      });
    }
  };

}).call(this);
