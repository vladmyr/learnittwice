"use strict";

var config = require("config").getOriginalConfig();
var http = require("http");
var httpServer = null;

var app = require("./app", config, function(err, app){
  httpServer = http.createServer()
  app.modules.express
});