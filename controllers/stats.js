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

  async.waterfall([
    function(cbf){
      var tmp = convertConditions(conditions);
      getData(collection, tmp, interval, cbf);
    }
  ], cbf);
  // debug('conditions:%j', conditions);
  // model.find(conditions, cbf);


};

var convertConditions = function(conditions){
  var result = {};
  var dateList = conditions.date.split(':').sort();
  var key = conditions.key;
  if(dateList.length == 2){
    result.date = {
      '$gte' : dateList[0],
      '$lte' : dateList[1]
    }
  }else{
    result.date = dateList[0];
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
  console.dir(JSON.stringify(conditions));
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
  return _.map(mergeResult, function(v, k){
    return {
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