"use strict";

var _ = require("underscore"),
  async = require("async"),
  express = require("express"),
  path = require("path"),
  cookieParser = require("cookie-parser"),
  bodyParser = require("body-parser"),

  utils = require("./helpers/utils");

module.exports = function(config, options, callback){
  var app = {
      environment: "development", //ToDo: dehardcode
      root_dir: __dirname,
      config: config,
      helpers: {
        utils: utils
      }
    },
    tasks = [];

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
    callback(null, app);
  });
};