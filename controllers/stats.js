var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var config = require('../config');
var mongodb = require('../helpers/mongodb');
var debug = require('debug')('jtdashboard.stats');

exports.view = function(req, res, cbf){
  cbf(null, {
    viewData : {
      globalVariable : {
        name : 'tree'
      }
    }
  });
};

exports.get = function(req, res, cbf){

  var collection = req.param('collection');
  // TODO 判断collection是否允许访问（只允许是性能统计的collection）
  

  var conditions = JSON.parse(req.query.conditions);
  var model = mongodb.getStatsModel(collection);
  console.log('get data form:%s, conditions:%j', collection, conditions);

  // TODO 对conditions的校验
  
  var interval = conditions.interval;
  if(_.isUndefined(interval) || interval <= 0){
    interval = 60
  }
  // 非develop环境，设置cache-control
  var maxAge = Math.min(interval, 600);
  if(config.env !== 'development'){
    res.header('Cache-Control', 'public, max-age=' + maxAge);
  }

  // 响应数据的格式
  var formatType = req.param('format') || 'json';
  // 用于对返回的结果再做筛选（要大于startTimestamp）
  var startTimestamp;
  async.waterfall([
    function(cbf){
      var tmp = convertConditions(conditions);
      startTimestamp = tmp.startTimestamp;
      delete tmp.startTimestamp;
      getData(collection, tmp, interval, cbf);
    },
    function(docs, cbf){
      // 如果存在startTimestamp,对返回的结果做整理
      if(startTimestamp){
        startTimestamp = Math.floor(startTimestamp / 1000);
        _.forEach(docs, function(doc){
          doc.values = _.filter(doc.values, function(v){
            return v.t > startTimestamp;
          });
        });
      }
      docs = formatData(docs, formatType);
      cbf(null, docs);
    }
  ], cbf);

};

/**
 * [formatData 格式化数据]
 * @param  {[type]} docs [description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
var formatData = function(docs, type){
  if(type === 'text'){
    var arr = [];
    _.forEach(docs, function(doc){
      arr.push(doc.key + '||');
      arr.push(doc.type + '||');
      var tmpArr = [];
      _.forEach(doc.values, function(value){
        tmpArr.push(value.t + '|' + value.v);
      });
      arr.push(tmpArr.join(',') + '\n');
    });
    return arr.join('').trim();
  }else{
    return docs;
  }
  
};

/**
 * [convertConditions 转换conditions]
 * @param  {[type]} conditions [description]
 * @return {[type]}            [description]
 */
var convertConditions = function(conditions){
  var result = {};
  var key = conditions.key;
  if(_.isArray(conditions.date)){
    result.date = {
      '$in' : conditions.date
    }
  }else{
    var dateList = conditions.date.split(':').sort();
    if(dateList.length == 2){
      result.date = {
        '$gte' : dateList[0],
        '$lte' : dateList[1]
      }
    }else if(dateList[0].length === 10){
      result.date = dateList[0];
    }else{
      // d 天，h 小时， m 分钟， s 秒
      var str = dateList[0];
      var keyList = {
        d : 'days',
        h : 'hours',
        m : 'minutes',
        s : 'seconds'
      };
      var date = moment();
      var end = date.format('YYYY-MM-DD');
      var unit = keyList[str.charAt(str.length - 1)];
      if(unit){
        var v = -parseInt(str);
        var startDate = date.add(v, unit);
        result.startTimestamp = startDate.valueOf();
        var start = startDate.format('YYYY-MM-DD');
        if(start !== end){
          result.date = {
            '$gte' : start,
            '$lte' : end
          };
        }else{
          result.date = end;
        }
      }else{
        result.date = end;
      }
    }
  }
  if(key){
    if(_.isArray(key)){
      result.key = {
        '$in' : key
      };
    }else if(key.charAt(0) === '/'){
      result.key = {
        '$regex' : key.substring(1, key.length - 1)
      };
    }else{
      result.key = key;
    }
  }
  return result;
};

/**
 * [getData 从mongodb中获取数据]
 * @param  {[type]} collection [description]
 * @param  {[type]} conditions [description]
 * @param  {[type]} interval   [description]
 * @param  {[type]} cbf        [description]
 * @return {[type]}            [description]
 */
var getData = function(collection, conditions, interval, cbf){
  debug('collection:%s, conditions:%j', collection, conditions);
  var mapOptions = {
    query : conditions,
    scope : {
      interval : interval
    },
    map : function(){
      var tenMinutes = 60 * 100;
      var minutes = 60;
      if(interval % tenMinutes === 0 && this.tenMinutes){
        // 使用10分钟间隔的统计数据
        delete this.minutes;
        delete this.seconds;
      }else if(interval % minutes === 0 && this.minutes){
        // 使用1分钟间隔的统计数据
        delete this.seconds;
        delete this.tenMinutes;
      }else{
        // 使用1秒间隔的统计数据
        delete this.minutes;
        delete this.tenMinutes;
      }
      emit(this._id, this);
    }
  };
  mongodb.getStatsModel(collection).mapReduce(mapOptions, function(err, docs){
    if(err){
      cbf(err);
    }else{
      docs = _.map(docs, function(doc){
        return doc.value;
      });
      docs = mergeDocs(docs, interval);
      cbf(null, docs);
    }
  });
};

/**
 * [mergeDocs 将相同key的数据合并]
 * @param  {[type]} docs [description]
 * @param  {[type]} interval [description]
 * @return {[type]}      [description]
 */
var mergeDocs = function(docs, interval){
  var mergeResult = {};
  _.forEach(docs, function(doc){
    var key = doc.key;
    if(!mergeResult[key]){
      mergeResult[key] = [];
    }
    var startOfSeconds = Math.floor(moment(doc.date, 'YYYY-MM-DD').valueOf() / 1000);
    var tenMinutes = 60 * 100;
    var minutes = 60;
    var time = 'seconds';
    var base = 1;
    if(interval % tenMinutes === 0 && doc.tenMinutes){
      time = 'tenMinutes';
      base = tenMinutes;
    }else if(interval % minutes === 0 && doc.minutes){
      time = 'minutes';
      base = minutes;
    }
    var tmpResult = {};
    // 将interval间隔之间的统计合并到一个object中
    _.map(doc[time], function(v, t){
      var seconds = parseInt(t) * base;
      var index = Math.floor(seconds / interval);
      if(!tmpResult[index]){
        tmpResult[index] = [];
      }
      tmpResult[index].push(v);
    });
    var result = [];
    var type = doc.type;
    //根据type类型，将interval间隔的统计计算出结果
    _.forEach(_.keys(tmpResult).sort(), function(index){
      var v = 0;
      switch(type){
        case 'counter':
          v = sum(tmpResult[index]);
        break;
        case 'average':
          v = average(tmpResult[index]);
        break;
        case 'gauge':
          v = _.last(tmpResult[index]);
        break;
      }
      result.push({
        t : index * interval + startOfSeconds,
        v : v
      });
    });
    mergeResult[key] = mergeResult[key].concat(result);
  });
  var getType = function(key){
    var type = '';
    _.each(docs, function(doc){
      if(doc.key === key){
        type = doc.type;
      }
    });
    return type;
  };
  return _.map(mergeResult, function(v, k){
    return {
      type : getType(k),
      key : k,
      values : v
    };
  });
};

/**
 * [sum 求和]
 * @param  {[type]} arr [description]
 * @return {[type]}     [description]
 */
var sum = function(arr){
  return _.reduce(arr, function(memo, num){
    return memo + num;
  }, 0);
};

/**
 * [average 求平均值]
 * @param  {[type]} arr [description]
 * @return {[type]}     [description]
 */
var average = function(arr){
  var total = sum(arr);
  return Math.round(total / (arr.length || 1));
};

// profs-stats-blue