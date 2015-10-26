"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");

module.exports = function(app, callback){
  return Promise.reduce([app.config.entryPoints.api] || [], function(total, entryPoint){
    var dir = path.join(app.root_dir, app.config.dir.services, entryPoint.alias);

    app.services[entryPoint.alias] = {};

    return app.helpers.utils.fs.scanDir(dir, {}, function(file){
      var basename = path.basename(file, path.extname(file));
      app.services[entryPoint.alias][basename] = require(path.join(dir, file))(app);
    }, 0);
  }).then(function(){
    return callback();
  }).catch(function(err){
    return callback(err);
  });
};