"use strict";

var path = require("path");
var config = require("config");

require("./app/index.js")(config, {}, function(err, app){
  var args = process.argv.splice(3);

  return require(path.join(__dirname , "console", process.argv[2]))(app, args, function(){
    return null;
  });
});