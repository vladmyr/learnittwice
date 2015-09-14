"use strict";

var Promise = require("bluebird");
var fs = require("fs");
var path = require("path");
var url = require("url");
var stream = require("stream");
var http = require("http");
var https = require("https");
var _ = require("underscore");
var slug = require("slug");

var utils = {};

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
   * Read whole file
   * @param filePath
   * @returns {bluebird}
   */
  readFile: function(filePath, options){
    options = _.extend({
      encoding: "utf8"
    }, options);

    return new Promise(function(fulfill, reject){
      fs.readFile(filePath, options, function(err, data){
        return err ? reject(err) : fulfill(data);
      });
    })
  },
  /**
   * Read file line by line
   * @param filePath
   * @param options
   * @param iteratee  - promise function that will be executed for each read line
   */
  readFileByLine: function(filePath, options, iteratee){
    !iteratee && (iteratee = Promise.resolve());

    return new Promise(function(fulfill, reject){
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
          return Promise.reduce(data, function(total, item){
            return typeof item !== "undefined" && item.length
              ? iteratee(item)
              : Promise.resolve();
          }, 0)
        }).then(function(){
          return readable.resume();
        }).then(function(){
          return callback();
        }).catch(function(err){
          return calblack(err);
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
   * Scan each file in a directory
   * @param path
   * @param options
   * @param iterator
   * @returns {bluebird}
   */
  scanDir: function(path, options, iterator){
    var include = function(includes, file){
      return includes.indexOf(file) !== -1
    };
    var exclude = function(excludes, file){
      return excludes.indexOf(file) === -1;
    };

    return new Promise(function(fulfill, reject){
      fs.readdir(path, function(err, files){
        if(err){
          return reject(err);
        }else{
          files.filter(function(file){
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
          .forEach(iterator);
          return fulfill();
        }
      })
    });
  },
  /**
   * Scan directory and generate uniq filename
   * @param filename
   */
  //generateUniqFilename: function(filename){
  //  var filePath = path.parse(filename);
  //
  //  return new Promise(function(fulfill, reject){
  //    fs.readdir(filePath.dir, function(err, fileNames){
  //      if(err){
  //        return reject(err);
  //      }else{
  //
  //      }
  //    });
  //  });
  //},
  /**
   * Create dir
   * @param filepath
   */
  mkdir: function(dir){
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
};

utils.net = {
  /**
   * Pipe data from internet
   * @param urlAddress
   * @param writable
   * @param options
   * @returns {Promise}
   */
  pipe: function(urlAddress, writable, options) {
    return new Promise(function(fulfill, reject){
      options = _.extend({
        onResponseRedirect: true
      }, options);

      if(!writable){
        return reject(new Error("No writable stream was passed"));
      }

      var urlObject = (typeof urlAddress === "string" ? url.parse(urlAddress) : urlAddress);

      (urlObject.protocol === "http" ? http : https).get(encodeURI(url.format(urlObject)), function (res) {
        if(res.statusCode === 404){
          res.pipe(writable);
        }else if(res.statusCode === 302){
          if(options.onResponseRedirect){
            var redirect = url.parse(res.headers.location);

            !!redirect.protocol && redirect.protocol !== "" && (urlObject.protocol = redirect.protocol);
            !!redirect.hostname && redirect.hostname !== "" && (urlObject.hostname = redirect.hostname);

            urlObject.pathname = url.parse(res.headers.location).pathname;

            (urlObject.protocol === "http" ? http : https).get(url.format(urlObject), function (res) {
              res.pipe(writable);
            });
          }else{
            res.pipe(writable);
          }
        }else{
          res.pipe(writable);
        }

        res.on("end", function(){
          return fulfill();
        });

      }).on("error", function(err){
        return Promise.reject(err);
      });
    });
  },
  /**
   * Pipe data from internet into local file
   * @param urlAddress
   * @param filename
   */
  pipeIntoFile: function(urlAddress, filename){
    var promise = Promise.resolve();

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

utils.string = {
  /**
   * Match all regex occurrences in string
   * @param string
   * @param regexp
   */
  matchAll: function(string, regexp){
    var matches = [];

    string.replace(regexp, function(){
      var arr = [].slice.call(arguments, 0);
      var extras = arr.slice(-2);
      arr.index = extras[0];
      arr.input = extras[1];
      matches.push(arr);
    });

    return matches;
  },
  /**
   * Generate unique string among passed array of strings
   * @param stringName
   * @param arrString
   * @returns {*}
   */
  generateUniqSlug: function(stringName, arrString){
    var resultString;
    var matches = utils.matchAll(stringName, arrString);

    return stringName;
  }
};

/**
 * Util function for database operations
 */
utils.db = {
  /**
   * Handle transaction commit
   * @param t - transaction
   */
  commit: function(t){
    return new Promise(function(fulfill, reject){
      if(t){
        return t
          .commit()
          .then(function(){
            return fulfill();
          })
          .catch(function(err){
            return reject(err);
          })
      }else{
        return reject(new Error("Transaction is not defined"));
      }
    });
  },
  /**
   * Handle transaction rollback
   * @param t - transaction
   */
  rollback: function(t){
    return new Promise(function(fulfill, reject){
      if(t){
        return t
          .rollback()
          .then(function(){
            return reject();
          })
          .catch(function(err){
            return reject(err);
          });
      }else{
        return reject(new Error("Transaction is not defined"));
      }
    });
  }
};

module.exports = utils;