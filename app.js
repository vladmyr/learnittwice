"use strict";

var _ = require("underscore");
var config = require("config");
var http = require("http");
var querystring = require("querystring");
var Promise = require("bluebird");

var app = require("./app/index.js")(config, {}, function(err, app){
  if(err){
    console.error(err, querystring.unescape(err.stack));
    return process.exit(0);
  }else{
    _.each(app.expressApps || [], function(expressApp){
      var httpServer = http.createServer(expressApp)
        .listen(expressApp.get("port"), function(err){
          return console.log("Listening '" + expressApp.get("alias") + "' on port", expressApp.get("port"));
        });
    });
  }
});