"use strict";

var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

module.exports = function(entryPoint, options, app){
  var expressApp = express();

  expressApp.set("port", entryPoint.port);
  expressApp.set("alias", entryPoint.alias || "");

  expressApp.set("views", path.join(app.root_dir, app.config.dir.views));
  expressApp.set("view engine", "jade");

  expressApp.use(bodyParser.json());
  expressApp.use(bodyParser.urlencoded({ extended: true }));

  entryPoint.hasPublic && expressApp.use(express.static(path.join(app.root_dir, app.config.dir.public, entryPoint.alias)));

  return app.helpers.utils.express.loadControllerHierarchy(entryPoint, express.Router(), app).then(function(router){
    expressApp.use(entryPoint["route_root"], router);
    return expressApp;
  });
};