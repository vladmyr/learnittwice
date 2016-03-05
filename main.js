"use strict";

var _ = require("underscore");
var config = require("config");
var http = require("http");
var Promise = require("bluebird");
var path = require("path");
var App = require(path.join(__dirname, config.file.app));

/**
 * Main initialization
 * TODO - finish refactoring
 */
config.dir.root = __dirname;
var app = new App(config);

return Promise.resolve().then(function(){
  // initialize application
  return app.initialize();
}).then(function(){
  // setup web servers for each entry point
  return Promise.each(app.expressApps, function(expressApp) {
    return new Promise(function (fulfill, reject) {
      // TODO - implement https protocol for different environments
      return http.createServer(expressApp).listen(expressApp.get("port"), function (err) {
        if (err) {
          return reject(err);
        } else {
          console.log("Listening '" + expressApp.get("alias") + "' on port", expressApp.get("port"));
          return fulfill();
        }
      });
    });
  }, { concurrency: 1 });
})
//  .catch(function(err){
//  // error handling
//  // TODO - implement decent error handling with logging
//  console.log(err, err.stack
//    ? JSON.parse(err.stack)
//    : "");
//  return process.exit(0);
//});


//}), {}, function(err, app){
//  if(err){
//    console.error(err, querystring.unescape(err.stack));
//    return process.exit(0);
//  }else{
//    // process each entry point
//    return Promise.each((app.expressApps || []), function(total, expressApp){
//      //run api
//      return new Promise(function(fulfill, reject){
//        return http.createServer(expressApp).listen(expressApp.get("port"), function(err){
//          if(err){
//            return reject(err);
//          }else{
//            console.log("Listening '" + expressApp.get("alias") + "' on port", expressApp.get("port"));
//            return fulfill();
//          }
//        });
//      });
//    }, { concurrency: 1 });
//  }
//});