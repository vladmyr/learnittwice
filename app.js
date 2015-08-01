"use strict";

var config = require("config");
var http = require("http");
var httpServer = null;

var app = require("./app/index.js")(config, {}, function(err, app){
  //httpServer = http.createServer()
});