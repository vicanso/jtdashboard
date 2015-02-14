'use strict';
var mongodb = require('../helpers/mongodb');
var User = mongodb.model('User');
var async = require('async');
var moment = require('moment');
var _ = require('lodash');
var uuid = require('node-uuid');
var crypto = require('crypto');
module.exports = function(req, res, cbf){
  var sess = req.session;
  var method = req.method;
  if(!req.cookies.jtuuid){
    // TODO 记录为用户第一次打开（新增用户）
    console.info('user++');
    res.cookie('jtuuid', uuid.v4(), {
      maxAge : 365 * 24 * 3600 * 1000
    });
  }
  if(!req.cookies.vicanso){
    // TODO 记录一个uv
    console.info('uv++');
  }
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
  if(!data){
    data = {
      anonymous : true,
      code : uuid.v4()
    };
    sess.data = data;
  }
  cbf(null, data);
};


var getSession = function(data){
  var result = _.pick(data, ['account', 'name']);
  result.anonymous = false;
  return result;
};

var register = function(sess, data, cbf){
  data = _.pick(data, ['account', 'password']);
  var date = moment().format('YYYY-MM-DDTHH:mm:ss');
  data.createdAt = date;
  data.lastLoginedAt = date;
  data.name = data.account;
  async.waterfall([
    function(cbf){
      new User(data).save(cbf);
    }, function(data, count, cbf){
      sess.data = getSession(data);
      cbf(null, sess.data);
    }
  ], cbf);
};


var login = function(sess, data, cbf){
  var shasum = crypto.createHash('sha1');
  async.waterfall([
    function(cbf){
      User.findOne({account : data.account}, cbf);
    },
    function(doc, cbf){
      shasum.update(doc.password + sess.data.code);
      if(shasum.digest('hex') === data.password){
        sess.data = getSession(doc);
        cbf(null, sess.data);
      }else{
        cbf(new Error('login fail!'));
      }
    }
  ], cbf);
  console.dir(data);

};