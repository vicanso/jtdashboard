'use strict';
module.exports = function(req, res, cbf){
  var sess = req.session;
  var method = req.method;
  switch(method){
    case 'GET':
      getUserInfo(sess, cbf);
    break;
  }
  // console.dir(method);
  // console.dir(sess);
  // cbf(null, {
  //   anonymous : true,
  //   name : 'vicanso'
  // });
};


var getUserInfo = function(sess, cbf){
  var data = sess.data;
  if(data){
    data.anonymous = false;
  }else{
    data = {anonymous : true};
  }
  cbf(null, data);
};