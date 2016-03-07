"use strict";

var Promise = require("bluebird");
var path = require("path");
var config = require("config");
var App = require(path.join(__dirname, config.file.app));

config.dir.root = __dirname;

var app = new App(config);

return Promise.resolve().then(function(){
  // initialize application
  return app.initialize();
}).then(function(){
  var args = process.argv.splice(3);
  // execute console script
  return require(path.join(__dirname , "console", process.argv[2]))(app, args, function(){
    process.exit(0);
  });
});