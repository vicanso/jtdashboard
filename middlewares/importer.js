'use strict';
var FileImporter = require('jtfileimporter');
var _ = require('lodash');
module.exports = function(options){
  return function(req, res, next){
    var importer = new FileImporter();
    _.each(options, function(v, k){
      importer[k] = v;
    });
    importer.debug = res.locals.DEBUG;
    res.locals.importer = importer;
    next();
  };
};