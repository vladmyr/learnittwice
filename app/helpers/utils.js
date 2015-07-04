"use strict";

var fs = require("fs");
var path = require("path");

var utils = {};

/**
 * Scan each file in a directory synchronously
 * @param path
 * @param exceptions
 * @param iterator
 */
utils.scanDirSync = function(path, exceptions, iterator){
  fs.readdirSync(path)
    .filter(function(file){
      return exceptions.indexOf(file) === -1;
    })
    .forEach(iterator)
}

module.exports = utils;