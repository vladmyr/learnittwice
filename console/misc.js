"use strict";

var Promise = require("bluebird");
var fs = require("fs");
var path = require("path");

/**
 * Used just for testing different staff
 * @param app
 * @param args
 * @param callback
 * @returns {*}
 */
module.exports = function(app, args, callback){
  return new Misc().createPath();
};

var Misc = function(){
  return {
    mkdir: function(){
      var dir = path.join(__dirname, "test");
      return fs.mkdir(dir, function(err){
        console.log(err, arguments);
      });
    },
    createPath: function(){
      var filepath = path.join(__dirname, Number(0).toString(), Number(1).toString(), Number(2).toString(), Number(3).toString());
      console.log(filepath);
      return filepath;
    }
  }
};