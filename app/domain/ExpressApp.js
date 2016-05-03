"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");

/**
 * Express application class
 * @param   {Object}        entryPoint
 * @param   {Application}   app
 * @param   {Object}        [options]
 * @returns {Promise}
 * @constructor
 */
var ExpressApp = function(entryPoint, app, options){
  var self = this;
  var expressApp = express();

  self.app = app;
  self.options = options || {};

  expressApp.set("port", entryPoint.port);
  expressApp.set("alias", entryPoint.alias || "");
  expressApp.set("allowedHosts", app.Util.Express.mapAllowedHosts(entryPoint.allowedHosts));

  expressApp.use(bodyParser.json());
  expressApp.use(bodyParser.urlencoded({ extended: true }));

  return self.app.Util.Express.loadControllerHierarchy(entryPoint, express.Router(), self.app).then(function(router){
    // load all controllers routes into express app
    expressApp.use(entryPoint.routeRoot, router);
    return expressApp;
  });
};

module.exports = ExpressApp;