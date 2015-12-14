"use strict";

// external dependencies
var _ = require("underscore");
var path = require("path");
var Promise = require("bluebird");
var Sequelize = require("sequelize");
var winston = require("winston");

/**
 * Database management class
 * @param   {Application} app
 * @param   {Object}  dbConfig
 * @param   {String}  modelDir
 * @param   {String}  refDb
 * @param   {String}  refModel
 * @constructor
 */
var Database = function(app, dbConfig, modelDir, refDb, refModel){
  this.app = app;
  this.dbConfig = dbConfig
    ? dbConfig
    : this.app.config.database;
  this.modelDir = !modelDir
    ? modelDir
    : this.modelDir = path.join(app.config.dir.root, app.config.path.dir.models);
  this.refDb = refDb
    ? refDb
    : "db";
  this.refModel = refModel
    ? refModel
    : "models";
  this.isInitialized = false;
  this.logger = null;
  this.loggerTransports = [];

  // initialize logging
  // TODO - fix
  !this.app.config.db.isEnabledFileLogging && (loggerTransports.push(
    new (winston.transports.File)({
      filename: path.join(
        app.root_dir,
        app.config.dir.logs,
        app.config.filePath.log.db
      ),
      json: false
    })
  ));
  !this.app.config.db.isEnabledConsoleLogging && (loggerTransports.push(
    new (winston.transports.Console)()
  ));

  /**
   * Execute raw (sql) queries from file
   * @param filePath
   * @param replacements
   * @param options
   * @returns {*}
   */
  var executeRawQueriesFromFile = function(filePath, replacements, options){
    var self = this;

    //ToDo: remove comments from queries
    return app.helpers.utils.fs.readFile(filePath, options).then(function(data){
      return data.split(/;\s/).map(function(i){
        return i.trim();
      }).filter(function(i){
        return !!i;
      })
    }).then(function(queries) {
      return Promise.reduce(queries, function(total, query){
        return app[refDb].query(query, {
          replacements: replacements,
          raw: true,
          type: app[refDb].QueryTypes.INSERT
        });
      }, 0);
    }).then(function(){
      return self;
    }).catch(function(err){
      return Promise.reject(err);
    })
  };

  var setForegnKeyCheck = function(check){
    return app[refDb].query("SET FOREIGN_KEY_CHECKS = " + (+check));
  };

  var alterIndices = function(model){
    if(!model.options.indexes || (Array.isArray(model.options.indexes) && !model.options.indexes.length)){
      return Promise.resolve();
    }

    var queryInterface = app[refDb].getQueryInterface();

    return Promise.resolve().then(function(){
      return app[refDb].query("SHOW INDEX FROM `" + model.tableName + "`", {
        replacements: {},
        raw: true,
        type: app[refDb].QueryTypes.SELECT
      });
    }).then(function(indexes){
      var newIndexes = [];

      _.each(model.options.indexes, function(index){
        if(!_.find(indexes, function(i){
          return i.Key_name == index.name;
        })){
          newIndexes.push(index);
        }
      });

      return newIndexes;
    }).then(function(newIndexes){
      return Promise.reduce(newIndexes, function(total, index){
        return queryInterface.addIndex(model.tableName, index.fields, {
          indexName: index.name,
          indicesType: index.unique ? "UNIQUE" : index.type,  //ToDo: improvement needed
          indexType: index.method
        });
      }, 0);
    });
  };

  var alterColumns = function(model){
    var queryInterface = app[refDb].getQueryInterface();

    return Promise.resolve().then(function(){
      return queryInterface.describeTable(model.tableName)
    }).then(function(attributes){
      var newColumns = {};

      _.each(model.rawAttributes, function(desc, name) {
        if(!attributes[name]){
          newColumns[name] = model.rawAttributes[name];
        }
      });

      return newColumns
    }).then(function(newColumns){
      return Promise.reduce(Object.keys(newColumns), function(total, name){
        return queryInterface.addColumn(model.tableName, name, newColumns[name]);
      }, 0);
    });
  };

  var alterPrimaryKey = function(model, options, callback){
    var tasks = [];

    options = _.extend({}, options);
  };

  return {
    initialize: initialize,
    migrate: migrate,
    executeRawQueriesFromFile: executeRawQueriesFromFile
  };
};

/**
 * Initialize database connection and DAO
 * @returns {Promise}
 */
Database.prototype.initialize = function(){
  var self = this;

  self.logger = new (winston.Logger)({
    transport: loggerTransports
  });

  return new Promise(function(fulfill, reject){
    var afterFunctions = [];

    if(typeof app[refDb] !== "undefined"){
      return reject(new Error("Database initialisation with refDb = '" + refDb + "' is already reserved"));
    }

    if(typeof app[refModel] !== "undefined"){
      return reject(new Error("Database initialisation with refModel = '" + refModel + "' is already reserved"));
    }

    if(typeof app.Sequelize === "undefined"){
      app.Sequelize = Sequelize;
    }

    app[refModel] = {};
    app[refDb] = new Sequelize(
      dbConfig.name,
      dbConfig.username,
      dbConfig.password,
      dbConfig.settings
      //_.extend(dbConfig.settings, {
      //  logging: function(message){
      //    return logger.log("info", message);
      //  }
      //})
    );

    app.helpers.utils.fs.scanDir(modelDir, {}, function(file){
      var filePath = path.join(modelDir, file);
      var container = require(filePath);
      var model;
      var define = function(name){
        return model = app[refModel][name] = app[refDb].define.apply(app[refDb], arguments);
      };

      define.after = function(fn){
        afterFunctions.push(function(){
          fn(model, refDb, refModel);
        });
      };

      container(define, Sequelize, app);
    }).then(function(){
      _.each(afterFunctions, function(fn){
        return fn();
      });
      self.isInitialized = true;

      return fulfill(self);
    });
  });
};

/**
 * Migrate/update database structure
 * @returns {Promise}
 */
Database.prototype.migrate = function(){
  if(!isInitialized){
    return Promise.reject(new Error("Database is not initialized"));
  }else {
    var self = this;
    var modelNames = Object.keys(app[refModel]);

    return Promise.resolve().then(function(){
      //  return setForegnKeyCheck(false);
      //}).then(function(){
      return app[refDb].sync();
    }).then(function(){
      return Promise.reduce(modelNames, function (total, modelName) {
        return alterColumns(app[refModel][modelName]);
      }, 0);
    }).then(function () {
      return Promise.reduce(modelNames, function (total, modelName) {
        return alterIndices(app[refModel][modelName]);
      }, 0);
      //}).then(function(){
      //  return setForegnKeyCheck(true);
    }).then(function(){
      return self;
    });
  }
};

Database.prototype.executeRawQueriesFromFile = function(){

};

module.exports = Database;