'use strict';

const _ = require('underscore');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const stream = require('stream');

class Fs {
  /**
   * Write data to file
   * @param filename
   * @param data
   * @param options
   * @returns {Promise}
   */
  static writeFile (filename, data, options) {
    return Promise.fromCallback((callback) => {
      fs.write(filename, data, _.extend({}, options), callback);
    });
  }

  /**
   * Read whole file
   * @param {String}  filePath
   * @param {Object}  [options]
   * @returns {Promise}
   */
  static readFile (filePath, options) {
    options = _.extend({
      encoding: "utf8"
    }, options);

    return Promise.fromCallback((callback) => {
      fs.readFile(filePath, _.extend({}, options), callback);
    })
  }

  /**
   * Read file line by line
   * @param filePath
   * @param [options]
   * @param iteratee  - promise function that will be executed for each read line
   */
  static readFileByLine (filePath, options, iteratee) {
    arguments.length == 2 && (iteratee = options);
    !iteratee && (iteratee = Promise.resolve());

    return new Promise((fulfill, reject) => {
      options = _.extend({
        encoding: "utf8",
        newLineChar: "\n"
      }, options);

      var innerPromise = Promise.resolve();
      var readable = fs.createReadStream(filePath, options);
      var writable = new stream.Writable();
      var last;

      writable._write = function(chunk, enc, callback){
        var chunkString = chunk.toString();
        var data = chunkString.split(options.newLineChar);

        if(last){
          var index = chunkString.indexOf(options.newLineChar);

          if(index !== 0){
            last += chunkString.substr(0, index);
            data = _.rest(data);
          }
          data.unshift(last);
          last = null;
        }

        if(chunkString.lastIndexOf(options.newLineChar) !== (chunkString.length - 1)){
          last = data.splice(-1)[0];
        }

        return innerPromise = innerPromise.then(function(){
          return readable.pause();
        }).then(function(){
          return Promise.each(data, function(item){
            return typeof item !== "undefined" && item.length
              ? iteratee(item)
              : Promise.resolve();
          })
        }).then(function(){
          return readable.resume();
        }).then(function(){
          return callback();
        }).catch(function(err){
          return callback(err);
        })
      };

      writable.on("finish", function(){
        if(last){
          innerPromise = innerPromise.then(function(){
            return iteratee(last);
          })
        }
        return innerPromise.then(fulfill);
      });

      writable.on("error", function(err){
        return reject(err);
      });

      readable.pipe(writable);
    }).catch(function(err){
      return Promise.reject(err);
    });
  }

  /**
   * Scan each file in a directory
   * @param   {String}    pathDir       directory to scan
   * @param   {Object}    [options]
   *                        [includes]
   *                        [excludes]
   * @param   {Function}  iterator      function to be executed for each file
   * @returns {Promise}
   */
  static scanDir (pathDir, options, iterator) {
    // process passed arguments
    switch (arguments.length) {
      case 2:
        iterator = options;
        break;
    }

    var include = function(includes, file){
      return includes.indexOf(file) !== -1
    };
    var exclude = function(excludes, file){
      return excludes.indexOf(file) === -1;
    };

    options.excludes = _.map(options.excludes || [], function(exclude){
      return path.basename(exclude, path.extname(exclude));
    });

    options.includes = _.map(options.includes || [], function(exclude){
      return path.basename(exclude, path.extname(exclude));
    });

    return new Promise(function(fulfill, reject){
      fs.readdir(pathDir, function(err, files){
        if(err){
          return reject(err);
        }else{
          return Promise.each(files.filter(function(file){
            var filter = true;

            file = path.basename(file, path.extname(file));

            if(options.includes.length && options.excludes.length){
              filter = include(options.includes, file) && exclude(options.excludes, file);
            }else if(options.includes.length){
              filter = include(options.includes, file);
            }else if(options.excludes.length){
              filter = exclude(options.excludes, file);
            }

            return filter;
          }), function(file){
            var basename = path.basename(file, path.extname(file));
            return iterator(file, basename);
          }, { concurrency: 1 }).then(function(){
            return fulfill();
          });
        }
      })
    });
  }

  /**
   * Create dir. Method is fulfilled if dir already exists
   * @param   {String}  dir
   * @returns {Promise}
   */
  static mkdir (dir){
    return new Promise(function(fulfill, reject){
      fs.mkdir(dir, function(err){
        if(!err || err.code === "EEXIST"){
          return fulfill();
        }else{
          return reject();
        }
      });
    });
  }
}

module.exports = Fs;