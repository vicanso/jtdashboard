(function() {
  var async, config, debug, mongodb, _;

  mongodb = require('../helpers/mongodb');

  config = require('../config');

  async = require('async');

  _ = require('underscore');

  debug = require('debug')('jt.controller.add');

  module.exports = function(req, res, cbf) {
    var Config;
    Config = mongodb.model('stats_config');
    return async.waterfall([
      function(cbf) {
        return Config.find({}, cbf);
      }, function(docs, cbf) {
        return cbf(null, {
          viewData: {
            page: 'configs',
            areaConfigs: [
              {
                cssClass: 'fa-align-left',
                title: '占显示区域1/3'
              }, {
                cssClass: 'fa-align-center',
                title: '占显示区域1/2'
              }, {
                cssClass: 'fa-align-right',
                title: '占显示区域2/3'
              }, {
                cssClass: 'fa-align-justify',
                title: '占满显示区域'
              }
            ],
            globalVariable: {
              configs: docs
            }
          }
        });
      }
    ], cbf);
  };

}).call(this);
