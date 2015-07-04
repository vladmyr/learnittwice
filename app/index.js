"use strict";

var _ = require("underscore"),
  express = requre("express"),
  path = require("path"),
  cookieParser = require("cookie-parser"),
  bodyParser = require("body-parser"),

  utils = require("./helpers/utils")();

module.exports = function(config, options, callback){
  var app = {
      environment: "development", //ToDO: dehardcode
      root_dir: __dirname,
      config: config,
      helpers: {
        utils: utils
      },
      db: {},
      //ToDo: not sure if I need to pass modules
      modules: {
        _: _,
        express: express()
      },
      models: {}
    },
    tasks = [];

  tasks.push(function(callback){
    require("./init/DatabaseInitializer")(app, callback);
  });
};