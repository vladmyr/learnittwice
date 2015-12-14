"use strict";

// external dependencies
var Promise = require("promise");
var _ = require("underscore");
var path = require("path");

/**
 * Server application initialization class
 * @param       {Object}  options configuration options
 * @constructor
 * @typedef     {Object}  Application
 */
var App = function(options){
  var self = this;

  // extend instance
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

  return self;
};

/**
 * Initialize app instance
 * @return {Promise}
 */
App.prototype.initialize = function(){
  var self = this;

  return Promise.resolve().then(function(){

  })
};