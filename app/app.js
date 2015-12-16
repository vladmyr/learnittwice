"use strict";

// external dependencies
var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");

/**
 * Server application initialization class
 * @param       {Object}  options configuration options
 * @returns     {Application}
 * @typedef     {Object}  Application
 * @constructor
 */
var Application = function(options){
  var self = this;

  // Application object construction
  self = _.extend({}, self, {
    LANGUAGE:       require(path.join(options.dir.root, options.file.const.language)),
    MEDIA_TYPE:     require(path.join(options.dir.root, options.file.const.mediaType)),
    VIEW_TEMPLATE:  require(path.join(options.dir.root, options.file.const.viewTemplate)),

    env: "development",
    config: options,
    expressApps: [],
    Util: require(path.join(options.dir.root, options.file.util))
    // TODO - httpParser
  });

  // object construction for each express entryPoint
  _.each(self.config.entryPoints, function(entryPoint){
    self[entryPoint.alias] = {};
  });

  return self;
};

/**
 * Initialize application instance
 * @memberOf Application
 * @return {Promise}
 */
Application.prototype.initialize = function(){
  var self = this;

  var DatabaseInitializer = require(path.join(self.config.dir.root, self.config.file.init.database));
  var ServiceInitializer = require(path.join(self.config.dir.root, self.config.file.init.service));

  return Promise.resolve().then(function(){
    // initialize database
    return new DatabaseInitializer(self);
  }).then(function(){
    // initialize express
    return new ServiceInitializer(self);
  }).then(function(){
    return self;
  });
};

module.exports = Application;