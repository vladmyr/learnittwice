"use strict";

var Promise = require("bluebird");
var path = require("path");
var config = require("config");

const global = require('./global');

/**
 * Console main initialization
 */
let app;

return global(config).then(() => {
  const App = alias.require('@file.app');
  app = new App(config);
}).then(() => {
  var args = process.argv.splice(3);
  // execute console script
  return require(path.join(__dirname, "console", process.argv[2]))(app, args, () => {});
}).then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err.stack);
  //console.trace(err);
  process.exit(1);
});