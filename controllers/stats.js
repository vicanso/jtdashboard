var _ = require('lodash');
var mongodb = require('../helpers/mongodb');

exports.view = function(req, res, cbf){
  cbf(null, {
    viewData : {
      globalVariable : {
        name : 'tree'
      }
    }
  });
};


_.delay(function(){
  var model = mongodb.getStatsModel('server-black');
  model.count({}, function(err, doc){
    console.dir(doc);
  });
}, 1000);

// profs-stats-blue