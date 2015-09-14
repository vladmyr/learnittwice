"use strict";

//load consts
var LANGUAGE = require("./domain/Language");

//load modules
var _ = require("underscore");
var async = require("async");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

//load customs
var utils = require("./helpers/utils");

module.exports = function(config, options, callback){
  var app = {
      environment: "development", //ToDo: dehardcode
      root_dir: __dirname,
      config: config,
      helpers: {
        utils: utils,
        httpParser: {}
      },
      const: {
        LANGUAGE: LANGUAGE
      }
    };
  var tasks = [];

  app.helpers.httpParser = new require("./helpers/httpParser")(app).getInstance();

  tasks.push(function(callback){
    require("./init/DatabaseInitializer")(app, callback);
  });

  //tasks.push(function(callback){
  //  if(config.entryPoints) {
  //    var expressApps = _.map(config.entryPoints, function(entryPoint){
  //      var eApp = express();
  //      _.extend(eApp, app);
  //      eApp.set("port", entryPoint.port);
  //      //eApp.loadController(entryPoint.controller, eApp);
  //    });
  //  }
  //  callback();
  //});

  async.series(tasks, function(err){
    callback(err, app);
  });
};