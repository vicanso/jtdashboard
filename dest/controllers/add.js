(function() {
  var StatsConfig, async, config, debug, mongodb, _;

  mongodb = require('../helpers/mongodb');

  config = require('../config');

  async = require('async');

  _ = require('underscore');

  StatsConfig = mongodb.model('stats_config');

  debug = require('debug')('jt.controller.add');

  module.exports = function(req, res, cbf) {
    var id, options;
    options = {
      collections: function(cbf) {
        return mongodb.getCollectionNames(cbf);
      }
    };
    id = req.param('id');
    if (id) {
      options.config = function(cbf) {
        return StatsConfig.findById(id, cbf);
      };
    }
    return async.parallel(options, function(err, result) {
      var chartTypes, collections;
      if (err) {
        debug('err: %s', err.stack);
        return cbf(err);
      } else {
        collections = _.filter(result.collections, function(collection) {
          return !~collection.indexOf('stats_');
        });
        debug('collections: %j', collections);
        chartTypes = [
          {
            name: '折线图',
            type: 'line'
          }, {
            name: '堆积折线图',
            type: 'stack'
          }, {
            name: '柱状图',
            type: 'barVertical'
          }, {
            name: '条形图',
            type: 'barHorizontal'
          }, {
            name: '堆积柱状图',
            type: 'stackBarVertical'
          }, {
            name: '堆积条形图',
            type: 'stackBarHorizontal'
          }, {
            name: '环形图',
            type: 'ring'
          }, {
            name: '标准饼图',
            type: 'pie'
          }, {
            name: '嵌套饼图',
            type: 'nestedPie'
          }, {
            name: '仪表盘',
            type: 'gauge'
          }, {
            name: '漏斗图',
            type: 'funnel'
          }
        ];
        return cbf(null, {
          viewData: {
            page: 'add',
            globalVariable: {
              collections: collections,
              chartTypes: chartTypes,
              config: result.config
            }
          }
        });
      }
    });
  };

}).call(this);
