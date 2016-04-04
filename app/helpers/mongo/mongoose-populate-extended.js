"use strict";

var PROPERTY_NAME = "asVirtual";  // custom property name;

/**
 * Check if array
 * @param   {Mixed}   obj
 * @returns {Boolean}
 */
function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

/**
 * Check if function
 * @param   {Mixed}   obj
 * @returns {Boolean}
 */
function isFunction(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]'
}

/**
 * Check if string
 * @param   {Mixed}   obj
 * @returns {Boolean}
 */
function isString(obj) {
  return typeof obj == "string";
}

/**
 * Empty function
 */
function noop () {}

/**
 * Plugin constructor
 */
var PopulateExtended = function(mongoose) {
  var self = this;

  self.mongoose = mongoose;
  self.migrations = {};
};

PopulateExtended.patchMongooseQuery = function (mongoose) {
  var Query = mongoose.Query;
  var populate = Query.prototype.populate;
  var exec = Query.prototype.exec;

  /**
   * Patched `populate` to support additional population options
   * @param paths
   * @param options
   * @returns {Mongoose.Query}
   */
  Query.prototype.populate = function (paths, options) {
    var query = this;
    var schema = query.schema;
    var populateExtended = schema._populateExtended || {};
    var normalizedPaths = PopulateExtended.normalizePaths(populateExtended.migrations, paths);

    // pass population paths that require migrations
    query._populateExtended = {
      paths: normalizedPaths
    };

    return populate.apply(query, arguments);
  };

  /**
   * Patched `exec` to add virtuals population hook
   * @param op
   * @param cb
   * @returns {MongoosePromise}
   */
  Query.prototype.exec = function(op, cb) {
    var query = this;
    var paths = (query._populateExtended || {}).paths;

    if (!paths.length) {
      return exec.call(query, op, cb);
    } else {
      var schema = query.schema;
      var migrations = schema._populateExtended.migrations;
      var promise;

      if (isFunction(op)) {
        cb = op;
        op = null;
      }
      else {
        cb = cb || noop;
      }

      var resolver = function (resolve, reject) {
        exec.call(this, op, function (err, docs) {
          if (err) {
            return cb(err), reject(err)
          }

          if (!docs) {
            return cb(null, docs), resolve(docs)
          }

          // process as an array
          docs = isArray(docs) ? docs : [docs];

          // migrate populations
          docs.map(function (doc) {
            return PopulateExtended.migratePopulations(doc, migrations, paths);
          });

          // restore original structure
          (docs.length == 1) && (docs = docs[0]);

          return cb(null, docs), resolve(docs);
        })
      }.bind(query);

      // Mongoose 4.1.x and up
      if (mongoose.Promise.ES6) {
        promise = new mongoose.Promise.ES6(resolver)
      }
      // backward compatibility
      else {
        promise = new mongoose.Promise;
        resolver(promise.resolve.bind(promise, null), promise.reject.bind(promise))
      }

      return promise;
    }
  };
};

/**
 * Performs population migrations,
 * Note: mutates 'doc' argument
 * @param doc
 * @param path
 * @param virtualKey
 * @returns {Mongoose.Document}
 */
PopulateExtended.migrateOnePopulation = function (doc, path, virtualKey) {
  var pathSplit = path.split(".");
  var refKey = pathSplit.slice(-1)[0];
  var refPath = pathSplit.slice(0, -1);
  var refs = PopulateExtended.gatherRefs(doc, refPath);

  // migrate population to the virtual property
  for (var i = 0, l = refs.length; i < l; i++) {
    if (typeof (refs[i][refKey] || {})._id != "undefined") {
      // doc is populated
      refs[i][virtualKey] = refs[i][refKey];
      refs[i][refKey] = refs[i][refKey]._id;
    }
  }

  return doc;
};

/**
 * Helper function. Gather into array all the path references from document
 * @param {Mongoose.Model}  doc
 * @param {Array.<String>}  pathSplit
 */
PopulateExtended.gatherRefs = function (doc, pathSplit) {
  var refs = [];
  var subDoc = doc[pathSplit[0]];
  var subPath = pathSplit.slice(1);

  if (subPath.length) {
    if (isArray(subDoc)) {
      subDoc.forEach(function (item) {
        refs = refs.concat(PopulateExtended.gatherRefs(item, subPath));
      });
    } else {
      refs = refs.concat(PopulateExtended.gatherRefs(subDoc, subPath));
    }
  } else if (subDoc) {
    // deepest nesting level
    refs = refs.concat(isArray(subDoc) ? subDoc : [subDoc]);
  }

  return refs;
};

/**
 *
 * @param doc
 * @param migrations
 * @param paths
 * @returns {Mongoose.Document}
 */
PopulateExtended.migratePopulations = function (doc, migrations, paths) {
  return paths.map(function (path) {
    return PopulateExtended.migrateOnePopulation(doc, path, migrations[path]);
  });
};

/**
 * Extends schema with provided functionality
 * @param {Mongoose.Schema} schema
 * @param {Object}          options
 */
PopulateExtended.prototype.attachToSchema = function (schema, options) {
  var self = this;

  self.processPaths(schema);

  // schema's populate extended options
  schema._populateExtended = {
    migrations: self.migrations
  };
};

/**
 * Process one schema's path
 * @param {Mongoose.Schema} schema
 * @param {Array.<String>}  [parentPath]
 */
PopulateExtended.prototype.processPaths = function (schema, parentPath) {
  var self = this;

  parentPath = parentPath || [];

  // loop through each path
  schema.eachPath(function (key, value) {
    var path = parentPath.concat(value.path);

    // find schema paths with `ref` and `asVirtual` properties defined
    if (typeof value.options.ref != "undefined" && typeof value.options[PROPERTY_NAME] != "undefined") {
      var virtualKey = value.options[PROPERTY_NAME];

      self.migrations[path.join(".")] = value.options[PROPERTY_NAME];

      // define virtual property if it was not done explicitly\
      if (path.length == 1 && typeof schema.virtual[virtualKey] == "undefined"){
        var innerVirtualKey = "__" + virtualKey;
        var virtual = schema.virtual(virtualKey);

        // TODO - override get/set instead of redefining
        virtual.get(function () {
          return this[innerVirtualKey];
        });

        virtual.set(function (data) {
          this[innerVirtualKey] = data;
        });
      }
    } else if (typeof value.schema != "undefined") {
      // process nested schema
      self.processPaths(value.schema, path);
    }
  });
};

/**
 * Returns paths that require population migrations'
 * @param   {Object} migrations
 * @param   {Array.<String>|String} paths
 * @returns {Array.<String>}
 */
PopulateExtended.normalizePaths = function (migrations, paths) {
  var normalized = [];

  if (migrations) {
    var migrationPaths = Object.keys(migrations);

    if (isString(paths)) {
      paths = paths.split(/\s/);
    }

    paths.forEach(function (path) {
      migrationPaths.indexOf(path) !== -1 && (normalized.push(path))
    });
  }

  return normalized;
};

/**
 * Plugin initializer
 * @param {Mongoose}  mongoose
 */
var Plugin = function (mongoose) {
  var populateExtended = new PopulateExtended(mongoose);

  PopulateExtended.patchMongooseQuery(mongoose);

  return populateExtended.attachToSchema.bind(populateExtended);
};

module.exports = Plugin;