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
 * @param   {Object}      [dbConfig]
 * @param   {String}      [modelDir]
 * @param   {String}      [refDb]
 * @param   {String}      [refModel]
 * @typedef {Object}      Database
 * @constructor
 */
var Database = function(app, dbConfig, modelDir, refDb, refModel){
  var self = this;

  self.app = app;
  self.dbConfig = dbConfig
    ? dbConfig
    : self.app.config.database;
  self.modelDir = modelDir
    ? modelDir
    : self.modelDir = path.join(self.app.config.dir.root, self.app.config.dir.models);
  self.refDb = refDb
    ? refDb
    : "db";
  self.refModel = refModel
    ? refModel
    : "models";
  self.isInitialized = false;
  self.logger = null;
  self.loggerTransports = [];

  // initialize logging
  // TODO - fix
  !self.app.config.db.isEnabledFileLogging && (self.loggerTransports.push(
    new (winston.transports.File)({
      filename: path.join(self.app.config.dir.root, self.app.config.file.log.db),
      json: false
    })
  ));
  !self.app.config.db.isEnabledConsoleLogging && (self.loggerTransports.push(
    new (winston.transports.Console)()
  ));

  return self;
};

/**
 * Execute SQL's FOREIGN_KEY_CHECKS command
 * @param   {Boolean} check
 * @returns {Promise}
 */
Database.prototype.setForeignKeyCheck = function(check){
  var self = this;
  return self.app[self.refDb].query("SET FOREIGN_KEY_CHECKS = " + (+check));
};

/**
 * Alter model indexes
 * @param   {Object}  model
 * @returns {Promise}
 */
Database.prototype.alterIndices = function(model){
  var self = this;
  var queryInterface = self.app[self.refDb].getQueryInterface();

  if(!model.options.indexes || (Array.isArray(model.options.indexes) && !model.options.indexes.length)){
    return Promise.resolve();
  } else {
    return Promise.resolve().then(function(){
      return self.app[self.refDb].query("SHOW INDEX FROM `" + model.tableName + "`", {
        replacements: {},
        raw: true,
        type: self.app[self.refDb].QueryTypes.SELECT
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
      return Promise.each(newIndexes, function(index){
        return queryInterface.addIndex(model.tableName, index.fields, {
          indexName: index.name,
          indicesType: index.unique ? "UNIQUE" : index.type,
          indexType: index.method
        });
      }, { concurrency: 1 });
    }).then(function(){
      return self;
    });
  }
};

/**
 * Alter existing model's table columns.
 * TODO - add column edit/remove functionality
 * @param model
 * @returns {Promise}
 */
Database.prototype.alterColumns = function(model){
  var self = this;
  var queryInterface = self.app[self.refDb].getQueryInterface();

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
    return Promise.each(Object.keys(newColumns), function(total, name){
      return queryInterface.addColumn(model.tableName, name, newColumns[name]);
    }, { concurrency: 1 });
  });
};

/**
 * Initialize database connection and DAO
 * @returns {Promise}
 */
Database.prototype.initialize = function(){
  var self = this;

  self.logger = new (winston.Logger)({
    transport: self.loggerTransports
  });

  return new Promise(function(fulfill, reject){
    var afterFunctions = [];

    if(typeof self.app[self.refDb] !== "undefined"){
      return reject(new Error("Database initialisation with refDb = '" + self.refDb + "' is already reserved"));
    }

    if(typeof self.app[self.refModel] !== "undefined"){
      return reject(new Error("Database initialisation with refModel = '" + self.refModel + "' is already reserved"));
    }

    if(typeof self.app.Sequelize === "undefined"){
      self.app.Sequelize = Sequelize;
    }

    self.app[self.refModel] = {};
    self.app[self.refDb] = new Sequelize(
      self.dbConfig.name,
      self.dbConfig.username,
      self.dbConfig.password,
      self.dbConfig.settings
      // TODO - fix logging
      //_.extend(dbConfig.settings, {
      //  logging: function(message){
      //    return logger.log("info", message);
      //  }
      //})
    );

    self.app.Util.fs.scanDir(self.modelDir, {}, function(file){
      var filePath = path.join(self.modelDir, file);
      var container = require(filePath);
      var model;
      var define = function(name){
        return model = self.app[self.refModel][name] = self.app[self.refDb].define.apply(self.app[self.refDb], arguments);
      };

      define.after = function(fn){
        afterFunctions.push(function(){
          fn(model, self.refDb, self.refModel);
        });
      };

      container(define, Sequelize, self.app);
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
  var self = this;

  if(!self.isInitialized){
    return Promise.reject(new Error("Database is not initialized"));
  }else {
    var modelNames = Object.keys(self.app[self.refModel]);

    return Promise.resolve().then(function(){
      //  return self.setForeignKeyCheck(false);
      //}).then(function(){
      return self.app[self.refDb].sync();
    }).then(function(){
      return Promise.each(modelNames, function (modelName) {
        return self.alterColumns(self.app[self.refModel][modelName]);
      }, { concurrency: 1 });
    }).then(function () {
      return Promise.each(modelNames, function (modelName) {
        return self.alterIndices(self.app[self.refModel][modelName]);
      }, { concurrency: 1 });
      //}).then(function(){
      //  return self.setForeignKeyCheck(true);
    }).then(function(){
      return self;
    });
  }
};

/**
 * Execute raw sql queries from file
 * @param   {String}  filePath
 * @param   {Object}  replacements
 * @param   {Object}  options
 * @returns {Promise}
 */
Database.prototype.executeRawQueriesFromFile = function(filePath, replacements, options){
  var self = this;

  //ToDo: remove comments from queries
  return self.app.Util.fs.readFile(filePath, options).then(function(data){
    return data.split(/;\s/).map(function(i){
      return i.trim();
    }).filter(function(i){
      return !!i;
    })
  }).then(function(queries) {
    return Promise.each(queries, function(total, query){
      return self.app[self.refDb].query(query, {
        replacements: replacements,
        raw: true,
        type: self.app[self.refDb].QueryTypes.INSERT
      });
    }, { concurrency: 1 });
  }).then(function(){
    return self;
  })
};

module.exports = Database;