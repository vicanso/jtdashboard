'use strict';
var fs = require('fs');
var async = require('async');
var path = require('path');
var _ = require('lodash');
module.exports = function(req, res, cbf){
  async.waterfall([
    function(cbf){
      var file = path.join(__dirname, '../statics/src/component/bootstrap.css');
      fs.readFile(file, 'utf8', cbf)
    },
    function(css, cbf){
      var reg = /\.glyphicon\-\S+\:before/gi;
      var arr = _.map(css.match(reg), function(str){
        return str.substring(1, str.length - 7);
      });
      cbf(null, {
        viewData : {
          glyphicons : arr
        }
      });
    }
  ], cbf)

};