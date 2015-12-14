"use strict";

var _ = require("underscore");
var config = require("config");
var http = require("http");
var querystring = require("querystring");
var Promise = require("bluebird");
var path = require("path");
var App = require(path.join(__dirname, config.path.file.appIndex));

/**
 * Main initialization
 * @type {App}
 */

// TODO - refactoring
var app = new App(_.extend(config, {
  path: {
    dir: {
      root: __dirname
    }
  }
}), {}, function(err, app){
  if(err){
    console.error(err, querystring.unescape(err.stack));
    return process.exit(0);
  }else{
    // process each entry point
    return Promise.each((app.expressApps || []), function(total, expressApp){
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
    }, { concurrency: 1 });
  }
});