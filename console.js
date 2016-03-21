"use strict";

var Promise = require("bluebird");
var path = require("path");
var config = require("config");
var App = require(path.join(__dirname, config.file.app));

config.dir.root = __dirname;

var app = new App(config);

return Promise.resolve().then(() => {
  // initialize application
  return app.initialize();
}).then(() => {
  var args = process.argv.splice(3);
  // execute console script
  return require(path.join(__dirname, "console", process.argv[2]))(app, args, () => {});
}).then(() => {
  process.exit(0);
}).catch((err) => {
  console.trace(err);
  process.exit(1);
});