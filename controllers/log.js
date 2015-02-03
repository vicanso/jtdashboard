'use strict';
var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var config = require('../config');
var mongodb = require('../helpers/mongodb');
var debug = require('debug')('jtdashboard.log');
exports.view = function(req, res, cbf){
  if(config.env !== 'development'){
    res.header('Cache-Control', 'public, max-age=300');
  }
  cbf(null, {
    viewData : {
      globalVariable : {
        name : 'tree'
      }
    }
  });
};