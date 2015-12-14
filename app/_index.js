"use strict";


//load constants
var LANGUAGE = require("./domain/const/Language");
var MEDIATYPE = require("./domain/const/MediaType");
var VIEWTEMPLATE = require("./domain/const/ViewTemplate");
var EXPRESSAPPTYPE = require("./domain/const/ExpressAppType");

//load modules
var _ = require("underscore");
var async = require("async");
var express = require("express");
var path = require("path");

//load customs
var utils = require("./helpers/Util");

module.exports = function(config, options, callback){
  var app = {
      environment: "development", //ToDo: dehardcode
      root_dir: __dirname,
      config: config,
      expressApps: [],
      helpers: {
        utils: utils,
        httpParser: {}
      },
      services: {},
      const: {
        LANGUAGE: LANGUAGE,
        MEDIATYPE: MEDIATYPE,
        VIEWTEMPLATE: VIEWTEMPLATE,
        EXPRESSAPPTYPE: EXPRESSAPPTYPE
      }
    };
  var tasks = [];

  app.helpers.httpParser = new require("./helpers/httpParser")(app).getInstance();

  tasks.push(function(callback){
    return require("./init/DatabaseInitializer")(app, callback);
  });

  tasks.push(function(callback){
    return require("./init/ServiceInitializer")(app, callback);
  });

  tasks.push(function(callback){
    return require("./init/ExpressInitializer")(app, callback);
  });

  async.series(tasks, function(err){
    return callback(err, app);
  });
};