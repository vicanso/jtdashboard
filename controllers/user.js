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
      login(sess, data, cbf);
    }
  }else if(method === 'DELETE'){
    sess.data = null;
    getUserInfo(sess, cbf);
  }else{
    cbf(new Error('not support method:' + method));
  }
};


var getUserInfo = function(sess, cbf){
  var data = sess.data;
  if(!data){
    data = {
      code : uuid.v4()
    };
    sess.data = data;
  }
  cbf(null, getSession(data));
};


var getSession = function(doc){
  if(doc.toObject){
    doc = doc.toObject();
  }
  var result = _.pick(doc, ['account', 'name', 'code', 'lastLoginedAt', 'loginTimes']);
  if(result.account){
    result.anonymous = false;
  }else{
    result.anonymous = true;
  }
  result.now = Date.now();
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
    }, function(doc, count, cbf){
      console.info('user:%s register success!', data.account);
      sess.data = doc;
      var userSession = getSession(sess.data);
      cbf(null, userSession);
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
        console.info('user:%s login success!', data.account);
        // 更新最近登录时间
        doc.lastLoginedAt =  moment().format('YYYY-MM-DDTHH:mm:ss');
        doc.loginTimes++;

        sess.data = doc;
        var userSession = getSession(sess.data);
        cbf(null, userSession);

        
        doc.save(function(err){
          if(err){
            console.error(err);
          }
        });

      }else{
        console.info('user:%s login fail!', data.account);
        cbf(new Error('login fail!'));
      }
    }
  ], cbf);
};