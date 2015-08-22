"use strict";

var Promise = require("bluebird");
var fs = require("fs");
var path = require("path");
var url = require("url");
var stream = require("stream");
var http = require("http");
var https = require("https");

var utils = {};

/**
 * Check if specified object is not undefined
 * @param obj
 * @return {Boolean} result
 */
utils.isDefined = function(obj){

};

/**
 * Extends fs module
 */
utils.fs = {
  /**
   * Write data to file
   * @param filename
   * @param data
   * @param options
   * @returns {Promise}
   */
  writeFile: function(filename, data, options){
    return new Promise(function(fulfill, reject){
      fs.writeFile(filename, data, _.extend({}, options), function(err){
        if(err){
          return reject(err);
        }else{
          return fulfill();
        }
      });
    });
  },
  /**
   * Scan each file in a directory synchronously
   * ToDo: add regular expression match functionality
   * @param {String} path - path to the directory to scan
   * @param {Object} options - options where "includes" and/or "excludes" can be defined
   * @param {Function} iterator - function that defines what actions will be performed on each file
   */
  scanDirSync: function(path, options, iterator){
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
  },
  /**
   * Scan directory and generate uniq filename
   * @param filename
   */
  generateUniqFilename: function(filename){
    var filePath = path.parse(filename);

    return new Promise(function(fulfill, reject){
      fs.readdir(filePath.dir, function(err, fileNames){
        if(err){
          return reject(err);
        }else{

        }
      });
    });
  }
};

utils.net = {
  /**
   * Pipe data from internet
   * @param urlAddress
   * @param writable
   * @returns {Promise}
   */
  pipe: function(urlAddress, writable) {
    return new Promise(function(fulfill, reject){
      if(!writable){
        return reject(new Error("No writable stream was passed"));
      }

      var urlObject = (typeof urlAddress === "string" ? url.parse(urlAddress) : urlAddress);

      console.log(url.format(urlObject));

      (urlObject.protocol === "http" ? http : https).get(url.format(urlObject), function (res) {
        res.pipe(writable);
      });
    });
  },
  /**
   * Pipe data from internet into local file
   * @param urlAddress
   * @param filename
   * @param options
   */
  pipeIntoFile: function(urlAddress, filename, options){
    var self;
    var promise = Promise.resolve();

    //if(options.uniqFilename){
    //  promise = promise.then(self.fs.generateUniqFilename);
    //}

    return promise.then(function(){
      return new Promise(function(fulfill, reject){
        var fileStream = fs.createWriteStream(filename);

        fileStream.on("finish", function(){
          return fulfill();
        });
        fileStream.on("error", function(err){
          return reject(err);
        });

        utils.net.pipe(urlAddress, fileStream);
      })
    })
  }
};

module.exports = utils;