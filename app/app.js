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
  var Util = require(path.join(options.dir.root, options.file.util));

  var ENV = require(path.join(options.dir.root, options.file.const.env));

  // Application object construction
  self = _.extend({}, self, {
    LANGUAGE:       require(path.join(options.dir.root, options.file.const.language)),
    MEDIA_TYPE:     require(path.join(options.dir.root, options.file.const.mediaType)),
    VIEW_TEMPLATE:  require(path.join(options.dir.root, options.file.const.viewTemplate)),

    env: ENV.DEVELOPMENT,
    config: options,
    expressApps: [],
    Util: Util
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

  var MiddlewareInitializer = require(path.join(self.config.dir.root, self.config.file.init.middleware));
  var DatabaseInitializer = require(path.join(self.config.dir.root, self.config.file.init.database));
  var ExpressInitializer = require(path.join(self.config.dir.root, self.config.file.init.express));

  return Promise.resolve().then(function() {
    // initialize middleware
    return new MiddlewareInitializer(self);
  }).then(function(){
    // initialize database
    return new DatabaseInitializer(self);
  }).then(function(){
    // initialize express
    return new ExpressInitializer(self);
  }).then(function(){
    return self;
  });
};

module.exports = Application;