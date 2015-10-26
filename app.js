"use strict";

var _ = require("underscore");
var config = require("config");
var http = require("http");
var querystring = require("querystring");
var Promise = require("bluebird");
var path = require("path");

var app = require(path.join(__dirname, config.dir.base.app, "index.js"))(config, {}, function(err, app){
  if(err){
    console.error(err, querystring.unescape(err.stack));
    return process.exit(0);
  }else{
    //ToDo: move clients to separate projects
    return Promise.reduce((app.expressApps || []), function(total, expressApp){
      //run api
      return new Promise(function(fulfill, reject){
        return http.createServer(expressApp).listen(expressApp.get("port"), function(err){
          if(err){
            return reject(err);
          }else{
            console.log("Listening '" + expressApp.get("alias") + "' on port", expressApp.get("port"));
            return fulfill();
          }
        });
      });
    }, 0);
  }
});