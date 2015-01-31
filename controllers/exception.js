'use strict';
module.exports = function(req, res, cbf){
  var body = req.body;
  if(body){
    var err = new Error(JSON.stringify(body));
    console.error(err);
  }
  cbf(null, {
    msg : 'success'
  });
};

