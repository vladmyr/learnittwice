"use strict";

// external dependencies
var path = require("path");

/**
 * Middleware initialization class
 * @param {Application} app
 * @param {Function}    [callback]
 * @constructor
 */
var MiddlewareInitializer = function(app, callback){
  var self = this;
  var middlewaresDir = path.join(app.config.dir.root, app.config.dir.middlewares);

  self.app = app;
  self.app.middleware = {};

  return self.app.Util.fs.scanDir(middlewaresDir, function(file, basename){
    return self.app.middleware[basename] = require(path.join(middlewaresDir, basename));
  }).nodeify(callback);
};

module.exports = MiddlewareInitializer;