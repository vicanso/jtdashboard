'use strict';
var mongodb = require('../helpers/mongodb');
var User = mongodb.model('User');
var async = require('async');
var moment = require('moment');
var _ = require('lodash');
module.exports = function(req, res, cbf){
  var sess = req.session;
  var method = req.method;
  if(method === 'GET'){
    getUserInfo(sess, cbf);
  }else if(method === 'POST'){
    var data = req.body;
    if(data.type === 'register'){
      register(sess, data, cbf);
    }else{
      login(sess, data, cbf)
    }
  }else{
    cbf(new Error('not support method:' + method));
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


var register = function(sess, data, cbf){
  data = _.pick(data, ['account', 'password']);
  var date = moment().format('YYYY-MM-DDTHH:mm:ss');
  data.createdAt = date;
  data.lastLoginedAt = date;
  console.dir(data);
  async.waterfall([
    function(cbf){
      new User(data).save(cbf);
    }, function(data, count, cbf){
      sess.data = {
        account : data.account,
        anonymous : false
      }
      cbf(null, sess.data);
    }
  ], cbf);
};


var login = function(){

};