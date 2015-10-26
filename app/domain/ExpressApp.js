"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");

module.exports = function(entryPoint, options, app){
  var expressApp = express();

  expressApp.set("port", entryPoint.port);
  expressApp.set("alias", entryPoint.alias || "");

  expressApp.use(bodyParser.json());
  expressApp.use(bodyParser.urlencoded({ extended: true }));

  entryPoint.hasView && expressApp.set("views", path.join(app.root_dir, app.config.dir.views, entryPoint.alias));
  entryPoint.hasView && expressApp.set("view engine", "jade");
  entryPoint.hasPublic && expressApp.use(express.static(path.join(app.root_dir, app.config.dir.public, entryPoint.alias)));

  return app.helpers.utils.express.loadControllerHierarchy(entryPoint, express.Router(), app).then(function(router){
    expressApp.use(entryPoint["routeRoot"], router);
    return expressApp;
  });
};