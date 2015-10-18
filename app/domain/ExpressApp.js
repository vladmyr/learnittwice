"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var serveStatic = require("serve-static");
var cookieParser = require("cookie-parser");
var renrd = require("rendr");
var compression = require("compression");

module.exports = function(entryPoint, options, app){
  if(entryPoint.type === app.const.EXPRESSAPPTYPE.PLAIN){
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
  }else if(entryPoint.type === app.const.EXPRESSAPPTYPE.RENDR){
    var rootDir = path.join(app.root_dir, app.config.dir.base[entryPoint.alias]);

    return Promise.resolve().then(function(){
      return require(path.join(rootDir, "index.js"))(entryPoint, app.config.entryPoints.api, app);
    });

    //expressApp.disable("x-powered-by");
    //
    //expressApp.use(compression());
    //expressApp.use(express.static(path.join(rootDir, app.config.dir.public)));
    //
    ////ToDo: move to external file
    //expressApp.use(function(req, res, next){
    //  console.log("[" + entryPoint.alias + "] request handling first on a chain");
    //  return next();
    //});
    //
    //var dataAdapterConfig = {
    //  default: {
    //    host: "localhost:" + app.config.entryPoints.api.port,
    //    protocol: app.config.entryPoints.api.protocol
    //  }
    //};
    //
    //var rendrServer
    //
    //return Promise.resolve(expressApp);
  }
};