"use strict";

var _ = require("underscore");
var config = require("config");
var http = require("http");
var querystring = require("querystring");

var app = require("./app/index.js")(config, {}, function(err, app){
  //ToDo: Find out what prevents program to exit on itself

  if(err){
    console.error(err, querystring.unescape(err.stack));
    return process.exit(0);
  }else{
    _.each(app.expressApps || [], function(expressApp){
      var httpServer = http.createServer(expressApp)
        .listen(expressApp.get("port"), function(err){
          return console.log("Listening on port", expressApp.get("port"));
        });
    });
  }
  //httpServer = http.createServer()
});