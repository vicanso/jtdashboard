'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');
var requireTree = require('require-tree');
var client = null;

/**
 * [init 初始化mongodb server]
 * @param  {[type]} uri     [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
var init = function(uri, options){
  options = options || {};
  var defaults = {
    db : {
      native_parser : true
    },
    server : {
      poolSize : 5
    }
  };
  options = _.extend(options, defaults);
  client = mongoose.createConnection(uri, options);
  client.on('connected', function(){
    console.info(uri + ' connected');
  });
  client.on('disconnected', function(){
    console.info(uri + ' disconnected');
  });
};

exports.close = function(cbf){
  if(client){
    client.close(cbf);
  }else{
    setImmediate(cbf);
  }
};

exports.init = _.once(init);


/**
 * [initModels 初始化models]
 * @param  {[type]} modelPath [description]
 * @return {[type]}           [description]
 */
exports.initModels = function(modelPath){
  if(!client){
    throw new Error('the db is not init!');
  }
  var models = requireTree(modelPath);
  _.forEach(models, function(model, name){
    name = name.charAt(0).toUpperCase() + name.substring(1);
    if(model.name){
      name = model.name;
    }
    var schema = new Schema(model.schema, model.options);
    if(model.indexes){
      _.forEach(model.indexes, function(indexOptions){
        schema.index(indexOptions);
      });
    }
    client.model(name, schema);
  });
};

/**
 * [model 获取model]
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
exports.model = function(name){
  if(!client){
    throw new Error('the db is not init!');
  }
  return client.model(name);
};


var initializedModels = [];
/**
 * [getStatsModel 通过collection name获取对应的model]
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
exports.getStatsModel = function(name){
  if(!client){
    throw new Error('the db is not init!');
  }
  var model;
  if(~_.indexOf(initializedModels, name)){
    model = client.model(name);
  }else{
    var schema = new Schema({}, {
      safe : false,
      strict : false,
      collection : name
    });
    schema.index([
      {
        key : 1
      },
      {
        key : 1,
        date : 1
      }
    ]);
    model = client.model(name, schema);
    initializedModels.push(name);
  }
  return model;
};
