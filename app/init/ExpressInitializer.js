"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");

module.exports = function(app, callback){
  var ExpressApp = require(path.join(app.root_dir, app.config.dir.domain, app.config.filePath.domain.expressApp));

  return Promise.reduce((app.config.entryPoints || []), function(total, entryPoint){
    return new ExpressApp(entryPoint, {}, app);
  }, 0).then(function(expressApp){
    app.expressApps.push(expressApp);
    return callback();
  }).catch(function(err){
    return callback(err);
  });
};