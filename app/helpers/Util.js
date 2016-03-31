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
var express = require("express");
var MongooseDeepPopulate = require("mongoose-deep-populate");

/**
 * Http status codes
 */
const HTTP_STATUS_CODE = {
  OK: 200,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  PERMISSION_DENIED: 550
};

/**
 * Custom utilities module
 * TODO - jsdoc
 * @module
 */
const Util = {};

Util.HTTP_STATUS_CODE = HTTP_STATUS_CODE;

/**
 * Extends fs module
 */
Util.fs = {
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
   * @param {String}  filePath
   * @param {Object}  [options]
   * @returns {Promise}
   */
  readFile: function(filePath, options){
    options = _.extend({
      encoding: "utf8"
    }, options);

    return new Promise(function(fulfill, reject){
      fs.readFile(filePath, options, function(err, data){
        return err
          ? reject(err)
          : fulfill(data);
      });
    })
  },
  /**
   * Read file line by line
   * @param filePath
   * @param [options]
   * @param iteratee  - promise function that will be executed for each read line
   */
  readFileByLine: function(filePath, options, iteratee){
    arguments.length == 2 && (iteratee = options);
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
  },
  /**
   * Scan each file in a directory synchronously
   * ToDo: add regular expression match functionality
   * @param {String} pathDir - path to the directory to scan
   * @param {Object} options - options where "includes" and/or "excludes" can be defined
   * @param {Function} iterator - function that defines what actions will be performed on each file
   */
  scanDirSync: function(pathDir, options, iterator){
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

    fs.readdirSync(pathDir)
      .filter(function(file){
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
      })
      .forEach(iterator)
  },
  /**
   * Scan each file in a directory
   * @param   {String}    pathDir       directory to scan
   * @param   {Object}    [options]
   *                        [includes]
   *                        [excludes]
   * @param   {Function}  iterator      function to be executed for each file
   * @returns {Promise}
   */
  scanDir: function(pathDir, options, iterator){
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

Util.net = {
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

        Util.net.pipe(urlAddress, fileStream);
      })
    })
  }
};

Util.string = {
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
   * TODO - under development
   * @param stringName
   * @param arrString
   * @returns {*}
   */
  generateUniqSlug: function(stringName, arrString){
    var resultString;
    var matches = Util.matchAll(stringName, arrString);

    return stringName;
  }
};

/**
 * Util function for database operations
 */
Util.db = {
  /**
   * Handle transaction commit
   * @param t                  - transaction
   * @param {boolean} [isSilent] - defines whether to throw exception on error
   */
  commit: function(t, isSilent){
    return new Promise(function(fulfill, reject){
      if(t){
        return t
          .commit()
          .then(function(){
            return fulfill();
          })
          .catch(function(err){
            return !!isSilent ? fulfill() : reject(err);
          })
      }else{
        return !!isSilent ? fulfill() : reject(new Error("Transaction is not defined"));
      }
    });
  },
  /**
   * Handle transaction rollback
   * @param t             - transaction
   * @param {Error} [err] - error that causes transaction rollback
   */
  rollback: function(t, err){
    return new Promise(function(fulfill, reject){
      if(t){
        return t
          .rollback()
          .then(function(){
            return reject();
          })
          .catch(function(tErr){
            return reject(err ? [err, tErr] : err);
          });
      }else{
        var tErr = new Error("Transaction is not defined");
        return reject(err ? [err, tErr] : err);
      }
    });
  }
};

/**
 * Enhanced model methods
 */
Util.model = {
  /**
   * Normalize query options
   * @param   {Object}  options
   * @returns {Object}
   */
  normalizeQueryOptions: function(options){
    return _.defaults(options || {}, {
      offset: 0,
      limit: 20
    })
  },
  /**
   * Normalize model association options
   * @param   {Object}  options
   * @returns {Object}
   */
  normalizeAssociationOptions(options) {
    return _.defaults(options || {}, {
      onDelete: "NO ACTION",
      onUpdate: "NO ACTION"
    })
  }
};

/**
 * Enhancements for Mongodb models
 */
Util.modelMongo = {
  /**
   * Define mongoose model
   * @param   {Application} app
   * @returns {Function}
   */
  define(app) {
    let mongooseDeepPopulate = MongooseDeepPopulate(app.mongoose);
    return (modelName, schemaDescription, options) => {
      // options defaults
      options = _.defaults({
        // model secondary indexes
        index: undefined,
        // model custom methods
        staticMethods: undefined,
        // model's instance custom methods
        instanceMethods: undefined,
        // auto index only in development environment
        autoIndex: app.env == app.ENV.DEVELOPMENT,
        // deepPopulate plugin options
        deepPopulateOptions: undefined
      }, options);

      const schema = new app.mongoose.Schema(schemaDescription, {
        autoIndex: options.autoIndex
      });

      // define indexes
      if (_.isArray(options.index)) {
        _.each(options.index, (index) => {
          schema.index(index.fields, index.options);
        });
      }

      // define model static methods
      if (!_.isEmpty(options.staticMethods)) {
        _.extend(schema.statics, options.staticMethods);
      }

      // register plugin
      schema.plugin(mongooseDeepPopulate);

      return app.mongoose.model(modelName, schema);
    }
  },
  /**
   * Map an array of mongoose model instances into plaint Object
   * @param   {Array.<Mongoose.Model>}  arr
   * @returns {Array.<Object>}
   */
  mapToObject(arr) {
    return _.map(arr, (item) => {
      return item.toObject();
    });
  }
};

/**
 * Util functions for arrays
 */
Util.arr = {
  /**
   * Slice array into chunks
   * @param arr
   * @param chunkSize
   * @returns {Array}
   */
  chunk: function(arr, chunkSize){
    var chunks = [];

    for(var chunkIndex = 0, totalChunks = Math.ceil(arr.length / chunkSize); chunkIndex < totalChunks; chunkIndex++){
      chunks.push(arr.slice(chunkIndex * chunkSize, chunkIndex * chunkSize + chunkSize));
    }

    return chunks;
  }
};

/**
 * Utility functionality for express
 */
Util.express = {
  /**
   * Define new route controller
   * @param controller
   */
  defineController: function(controller){
    _.defaults(controller, {
      bind: function(method){
        return this[method].bind(this);
      }
    });

    return controller.setup();
  },

  /**
   * Load controller hierarchy
   * @param entryPoint
   * @param router
   * @param app
   * @returns {Object}  container that hold controller`s logic
   */
  loadControllerHierarchy: function(entryPoint, router, app){
    // container for entry controller
    var container = require(path.join(app.config.dir.root, entryPoint.file.entryController));
    return container(entryPoint, router, app);
  },

  /**
   *
   * @param container
   * @param router
   * @param app
   * @returns {express.Router}
   */
  loadOneNestedController: function(container, router, app){
    if(typeof container === "string"){
      container = require(path.join(app.config.dir.root, container));
    }
    container(router, app);
    return router;
  },

  /**
   * Load all nested controllers of entry controller for express entry point
   * @param   {String}                  pathDir   controllers` parent directory
   * @param   {String|Array<String>}    exclude   controllers` file names that must be excluded
   * @param   {express.Router}          router    express application router
   * @param   {Application}             app
   * @returns {Promise}
   */
  loadAllNestedControllers: function(pathDir, exclude, router, app){
    return Promise.resolve().then(function(){
      // scan controller's parent directory
      return Util.fs.scanDir(pathDir, { excludes: Array.isArray(exclude)
        ? exclude
        : [exclude]
      } , function(file, basename){
        var filePath = path.join(pathDir, basename);
        var container = require(filePath);  // controller's container

        // load controller's container into a separate router
        var nestedRouter = Util.express.loadOneNestedController(container, express.Router(), app);

        // if controller nester route was not specified set one according to basename
        var root = nestedRouter.path || basename;
        _.each((Array.isArray(root)
          ? root
          : [root]
        ), function(routePath){
          routePath = url.resolve("/", routePath);
          // attach controller's router into express router
          router.use(routePath, nestedRouter);
        });
      });
    }).then(function(){
      return router;
    });
  },
  /**
   * Maps allowed hosts
   * @param   {Array<Object>} hosts
   * @returns {Array<String>}
   */
  mapAllowedHosts: function(hosts){
    return _.map(hosts || [], function(item){
      return url.format(item);
    })
  },

  /**
   * Send response
   * @param {express.Response}  res
   * @param {Number}            code
   * @param {Object|String}     data
   */
  respond(res, code, data) {
    // See https://google.github.io/styleguide/jsoncstyleguide.xml for details
    let json = {};

    if (code === Util.HTTP_STATUS_CODE.OK) {
      // success
      json = _.extend({}, json, {
        data: data
      })
    } else {
      // error
      // map data
      // TODO - refactor error handling implementation
      if (typeof data.toString !== "undefined") {
        data = data.toString();
      }

      json = _.extend({}, json, {
        error: {
          code: code,
          message: data
        }
      })
    }

    return res.status(code).json(json);
  }
};

/**
 * Type casting utility module
 */
Util.Typecast = {
  /**
   * Cast argument into number type
   * @param   {Mixed}   n
   * @returns {Number}
   */
  Number(n) {
    let cast = Number(n);

    return _.isNaN(cast)
      ? 0
      : cast;
  }
};

module.exports = Util;