(function() {
  var JTError, total;

  JTError = require('../helpers/jterror');

  total = 0;

  module.exports = function(req, res, cbf) {
    res.header('Cache-Control', 'public, max-age=30');
    res.header('Pragma', 'nocache');
    console.dir('.......');
    if (total) {
      res.status(500).send('{a : 1}');
      return;
    }
    total++;
    return cbf(null, {
      name: 'vicanso'
    });
  };

}).call(this);
