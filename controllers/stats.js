var _ = require('lodash');
var async = require('async');
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
  if(interval <= 0){
    interval = 60
  }
  // 非develop环境，设置cache-control
  var maxAge = Math.min(interval, 600);
  if(config.env !== 'development'){
    res.header('Cache-Control', 'public, max-age=' + maxAge);
  }

  async.waterfall([
    function(cbf){
      var tmp = _.pick(conditions, ['key', 'date']);
      getData(collection, tmp, interval, cbf);
      // model.find(tmp, cbf);
    },
    function(docs, cbf){
      console.dir(docs);
    }
  ])
  // debug('conditions:%j', conditions);
  // model.find(conditions, cbf);


};


var getData = function(collection, conditions, interval, cbf){
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
      // cbf(null, _.map(docs, function(doc){
      //   // doc = doc.toObject();
      //   return doc.value;
      // }));
    }
  });
};

// profs-stats-blue