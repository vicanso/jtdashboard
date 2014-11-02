(function() {
  var arrangePoints, async, average, config, debug, getStatsData, logger, mergeDocs, moment, mongodb, sum, _;

  mongodb = require('../helpers/mongodb');

  config = require('../config');

  async = require('async');

  moment = require('moment');

  debug = require('debug')('jt.controller.stats');

  _ = require('underscore');

  logger = require('../helpers/logger')(__filename);

  module.exports = function(req, res, cbf) {
    var funcs, interval, keys, maxAge, query, _ref;
    query = JSON.parse(req.query.conditions);
    if (!query.date) {
      cbf(new Error('date can not be null'));
      return;
    }
    if (!query.keys) {
      cbf(new Error('keys can not be null'));
      return;
    }
    if (!query.point) {
      cbf(new Error('point can not be null'));
      return;
    }
    interval = (_ref = query.point) != null ? _ref.interval : void 0;
    if (interval && interval > 0) {
      maxAge = Math.min(interval, 1800);
    } else {
      maxAge = 0;
    }
    if (config.env === 'development') {
      res.header('Cache-Control', 'no-cache, no-store');
    } else {
      res.header('Cache-Control', "public, max-age=" + maxAge);
    }
    keys = query.keys;
    if (!_.isArray(keys)) {
      keys = [keys];
    }
    funcs = _.map(keys, function(key) {
      return function(cbf) {
        return getStatsData(query, key, cbf);
      };
    });
    debug('start:%j', query);
    return async.parallel(funcs, function(err, data) {
      if (err) {
        return cbf(err);
      } else {
        data = _.flatten(data, true);
        debug('finished:%j ', query);
        return cbf(null, data);
      }
    });
  };

  getStatsData = function(query, key, cbf) {
    var collection, conditions, date, fill, getDate, interval, now, point, value;
    collection = query.category;
    date = query.date;
    fill = query.fill;
    point = query.point;
    interval = GLOBAL.parseInt(point != null ? point.interval : void 0);
    if (_.isNaN(interval)) {
      interval = 60;
    }
    conditions = {};
    now = moment();
    getDate = function(date) {
      var formatDate;
      formatDate = '';
      if (date) {
        if (date === 'currentMonth') {
          formatDate = now.clone().date(1).format('YYYY-MM-DD');
        } else if (date.length === 10) {
          formatDate = date;
        } else {
          date = GLOBAL.parseInt(date);
          formatDate = now.clone().add(date, 'day').format('YYYY-MM-DD');
        }
      } else {
        formatDate = now.format('YYYY-MM-DD');
      }
      return formatDate;
    };
    if (date) {
      conditions.date = {
        '$gte': getDate(date.start),
        '$lte': getDate(date.end)
      };
    } else {
      conditions.date = now.format('YYYY-MM-DD');
    }
    debug('conditions:%j', conditions);
    if (key) {
      value = key.value;
      if (key.type === 'reg') {
        conditions.key = {
          '$regex': value
        };
      } else {
        conditions.key = value;
      }
    }
    return async.waterfall([
      function(cbf) {
        return mongodb.model(collection).find(conditions, cbf);
      }, function(docs, cbf) {
        docs = mergeDocs(docs);
        if (interval < 0) {
          _.each(docs, function(doc) {
            doc.values = [_.last(doc.values)];
          });
          return cbf(null, docs);
        } else if (interval > 0) {
          return cbf(null, arrangePoints(docs, interval, fill));
        } else {
          return cbf(null, docs);
        }
      }
    ], cbf);
  };


  /**
   * [sum description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */

  sum = function(data) {
    return _.reduce(data, function(memo, num) {
      return memo + num;
    }, 0);
  };


  /**
   * [average description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */

  average = function(data) {
    var total;
    total = sum(data);
    return Math.round(total / data.length);
  };


  /**
   * [mergeDocs 将相同key的数据合并]
   * @param  {[type]} docs [description]
   * @return {[type]}      [description]
   */

  mergeDocs = function(docs) {
    var result;
    result = {};
    _.each(docs, function(doc) {
      var key, startOfSeconds;
      doc = doc.toObject();
      key = doc.key;
      if (!result[key]) {
        result[key] = [];
      }
      startOfSeconds = Math.floor(moment(doc.date, 'YYYY-MM-DD').valueOf() / 1000);
      doc.values = _.map(doc.values, function(value) {
        var tmp;
        tmp = {};
        _.each(value, function(v, t) {
          tmp.t = GLOBAL.parseInt(t) + startOfSeconds;
          tmp.v = v;
        });
        return tmp;
      });
      return result[key].push(doc);
    });
    return _.map(result, function(values, key) {
      var firstItem, lastItem, obj, tmp;
      firstItem = _.first(values);
      lastItem = _.last(values);
      obj = _.omit(firstItem, ['values']);
      obj.start = firstItem.date;
      obj.end = lastItem.date;
      tmp = _.sortBy(_.flatten(_.pluck(values, 'values')), function(item) {
        return item.t;
      });
      obj.values = tmp;
      return obj;
    });
  };

  arrangePoints = function(docs, interval, fill) {
    var getArr;
    getArr = function(start, interval, length) {
      var arr, i, _i, _ref;
      arr = new Array(length);
      for (i = _i = 0, _ref = arr.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        arr[i] = {
          v: [],
          t: start
        };
        start += interval;
      }
      return arr;
    };
    docs = _.map(docs, function(doc) {
      var end, now, oneDaySeconds, result, start, type, values;
      values = doc.values;
      type = doc.type;
      start = Math.floor(moment(doc.start).valueOf() / 1000);
      oneDaySeconds = 24 * 3600;
      end = Math.floor(moment(doc.end).valueOf() / 1000) + oneDaySeconds;
      now = Math.floor(Date.now() / 1000);
      if (end > now) {
        end = now;
      }
      result = getArr(start, interval, Math.ceil((end - start) / interval));
      _.each(doc.values, function(data) {
        var index;
        index = Math.floor((data.t - start) / interval);
        if (result[index]) {
          return result[index].v.push(data.v);
        }
      });
      result = _.map(result, function(data) {
        var value;
        if (data.v.length) {
          switch (type) {
            case 'counter':
              value = sum(data.v);
              break;
            case 'average':
              value = average(data.v);
              break;
            case 'gauge':
              value = _.last(data.v);
          }
          return {
            t: data.t,
            v: value
          };
        } else {
          if (fill) {
            return {
              t: data.t,
              v: 0
            };
          } else {
            return null;
          }
        }
      });
      if (!fill) {
        result = _.compact(result);
      }
      doc.values = result;
      return doc;
    });
    return docs;
  };

}).call(this);
