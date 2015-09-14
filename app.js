"use strict";

var config = require("config");
var http = require("http");
var httpServer = null;

var app = require("./app/index.js")(config, {}, function(err, app){
  //ToDo: Find out what prevents program to exit on itself
  return process.exit(0);
  //httpServer = http.createServer()
});