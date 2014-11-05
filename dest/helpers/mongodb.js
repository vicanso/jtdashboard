(function() {
  var Schema, client, logger, modelDict, mongoose, requireTree, _;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  _ = require('underscore');

  requireTree = require('require-tree');

  logger = require('./logger')(__filename);

  client = null;

  modelDict = {};


  /**
   * [init description]
   * @param  {[type]} uri     [description]
   * @param  {[type]} options =             {} [description]
   * @return {[type]}         [description]
   */

  module.exports.init = function(uri, options) {
    var defaults;
    if (options == null) {
      options = {};
    }
    if (client) {
      return;
    }
    defaults = {
      db: {
        native_parser: true
      },
      server: {
        poolSize: 5
      }
    };
    _.extend(options, defaults);
    client = mongoose.createConnection(uri, options);
    client.on('connected', function() {
      return logger.info("" + uri + " connected");
    });
    client.on('disconnected', function() {
      return logger.info("" + uri + " disconnected");
    });
  };


  /**
   * [initModels 初始化models]
   * @param  {[type]} modelPath [description]
   * @return {[type]}           [description]
   */

  module.exports.initModels = function(modelPath) {
    var models;
    if (!client) {
      throw new Error('the db is not init!');
    }
    models = requireTree(modelPath);
    _.each(models, function(model, name) {
      var schema;
      name = name.charAt(0).toUpperCase() + name.substring(1);
      if (model.name) {
        name = model.name;
      }
      schema = new Schema(model.schema, model.options);
      if (model.indexes) {
        _.each(model.indexes, function(indexOptions) {
          return schema.index(indexOptions);
        });
      }
      modelDict[name] = client.model(name, schema);
    });
  };


  /**
   * [model 获取mongoose的model]
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */

  module.exports.model = function(name) {
    var model, schema;
    if (!client) {
      throw new Error('the db is not init!');
    }
    if (modelDict[name]) {
      return modelDict[name];
    } else {
      schema = new Schema({}, {
        safe: false,
        strict: false,
        collection: name
      });
      schema.index([
        {
          key: 1
        }, {
          key: 1,
          date: 1
        }
      ]);
      model = client.model(name, schema);
      modelDict[name] = model;
      return model;
    }
  };

  module.exports.getCollectionNames = function(cbf) {
    if (!client) {
      return cbf(new Error('the db is not init!'));
    }
    client.db.collectionNames(function(err, names) {
      var result;
      if (err) {
        cbf(err);
      } else {
        result = [];
        _.each(names, function(info) {
          var infos, name;
          infos = info.name.split('.');
          infos.shift();
          name = infos.join('.');
          if (_.first(infos) !== 'system') {
            return result.push(name);
          }
        });
        cbf(null, result);
      }
    });
  };

}).call(this);
