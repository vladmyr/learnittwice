"use strict";

// external dependencies
var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");

/**
 * Express applications initialization class
 * @param   {Application}   app
 * @param   {Function}      [callback]
 * @constructor
 */
var ExpressInitializer = function(app, callback){
  var self = this;

  self.app = app;
  // load application dependency
  var ExpressApp = require(path.join(self.app.config.dir.root, self.app.config.file.domain.expressApp));

  // for each express entry point
  return Promise.each(_.toArray(self.app.config.entryPoints), function(entryPoint){
    // initialize express application
    return new ExpressApp(entryPoint, self.app).then(function(expressApp){
      // add reference to application instance
      return self.app.expressApps.push(expressApp);
    })
  }, { concurrency: 1 }).nodeify(callback);
};

module.exports = ExpressInitializer;