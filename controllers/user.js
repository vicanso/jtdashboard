'use strict';
module.exports = function(req, res, cbf){
  if(req.query.cache !== 'false'){
    res.status(302).redirect(req.url + '?cache=false');
    return;
  }
  cbf(null, {
    anonymous : true,
    name : 'vicanso'
  });
};