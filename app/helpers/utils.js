"use strict";

var fs = require("fs");
var path = require("path");

var utils = {};

/**
 * Scan each file in a directory synchronously
 * ToDo: add regular expression match functionality
 * @param {String} path - path to the directory to scan
 * @param {Object} options - options where "includes" and/or "excludes" can be defined
 * @param {Function} iterator - function that defines what actions will be performed on each file
 */
utils.scanDirSync = function(path, options, iterator){
  var include = function(includes, file){
    return includes.indexOf(file) !== -1
  };
  var exclude = function(excludes, file){
    return excludes.indexOf(file) === -1;
  };

  fs.readdirSync(path)
    .filter(function(file){
      var filter = true;

      if(options.includes && options.excludes){
        filter = include(options.includes, file) && exclude(options.excludes, file);
      }else if(options.includes){
        filter = include(options.includes, file);
      }else if(options.excludes){
        filter = exclude(options.excludes, file);
      }

      return filter;
    })
    .forEach(iterator)
};

/**
 * Check if specified object is not undefined
 * @param obj
 * @return {Boolean} result
 */
utils.isDefined = function(obj){

};

module.exports = utils;