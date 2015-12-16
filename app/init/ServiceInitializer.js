"use strict";

// external dependencies
var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");

/**
 * Service initialization class
 * @param       {Application} app
 * @param       {Function}    [callback]
 * @constructor
 */
var ServiceInitializer = function(app, callback){
  var self = this;

  self.app = app;

  return Promise.each([app.config.eatryPoints.api], function(entryPoint){
    // services directory
    var dir = path.join(app.config.dir.root, app.config.dir.services, entryPoint.alias);

    // application object construction for services
    app[entryPoint.alias].services = {};

    // for each file in service directory
    return app.Util.fs.scanDir(dir, {}, function(file, basename){
      app[entryPoint.alias].services[basename] = require(path.join(dir, file))(self.app);
    });
  }, { concurrency: 1 }).nodeify(callback);
};

module.exports = ServiceInitializer;