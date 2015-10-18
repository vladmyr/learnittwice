"use strict";

var express = require("express");
var rendr = require("rendr");
var compression = require("compression");
var bodyParser = require("body-parser");
var serveStatic = require("serve-static");

var RendrApp = function(entryPoint, apiEntryPoint, app){
  var expressApp = express();

  expressApp.set("port", entryPoint.port);
  expressApp.set("alias", entryPoint.alias || "");

  var dataAdapterConfig = {
    "default": {
      host: "localhost:" + apiEntryPoint.port,
      protocol: apiEntryPoint.protocol
    }
  };

  var server = rendr.createServer({
    dataAdapterConfig: dataAdapterConfig
  });

  server.configure(function (expressApp) {
    expressApp.use(compression());
    expressApp.use(serveStatic(__dirname + "app/public"));
    expressApp.use(bodyParser.json());
  });

  app.use(entryPoint.routeRoot, server.expressApp);

  var start = function(){
    app.listen(port);
    console.log("server pid %d listening on port %s in % %s mode", process.pid, port, app.get("env"));
  };

  if (require.main === module) {
    start();
  }
};

exports.app = new RendrApp;