"use strict";

var express = require("express");
var rendr = require("rendr");
var compression = require("compression");
var bodyParser = require("body-parser");
var serveStatic = require("serve-static");

var app = express();
var dataAdapterConfig = {
  "default": {
    host: "localhost:8081",
    protocol: "http"
  }
};

var server = rendr.createServer({
  dataAdapterConfig: dataAdapterConfig
});

server.configure(function (expressApp) {
  expressApp.use(compress());
  expressApp.use(serveStatic(__dirname + "app/public"));
  expressApp.use(bodyParser.json());
});

app.use("/", server.expressApp);

var start = function(){
  var port = process.env.PORT || 3939;
  app.listen(port);
  console.log("server pid %d listening on port %s in % %s mode", process.pid, port, app.get("env"));
};

if (require.main === module) {
  start();
}

exports.app = app;