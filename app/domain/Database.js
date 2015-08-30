"use strict";

var _ = require("underscore");
var path = require("path");
var Promise = require("bluebird");
var Sequelize = require("sequelize");
var async = require("async");

/**
 * Database management class
 * @param app
 * @param dbConfig
 * @param modelDir
 * @param refDb
 * @param refModel
 * @returns {{initialize: Function}}
 * @constructor
 */
var Database = function(app, dbConfig, modelDir, refDb, refModel){
  var isInitialized = false;
  //initialize defaults
  !dbConfig && (dbConfig = app.config.database);
  !modelDir && (modelDir = path.join(app.root_dir, app.config.dir.models));
  !refDb && (refDb = "db");
  !refModel && (refModel = "models");

  /**
   * Initialize database connection and DAO
   * @returns {bluebird}
   */
  var initialize = function(){
    var self = this;

    return new Promise(function(fulfill, reject){
      var afterFunctions = [];

      if(typeof app[refDb] !== "undefined"){
        return reject(new Error("Database initialisation with refDb = '" + refDb + "' is already reserved"));
      }

      if(typeof app[refModel] !== "undefined"){
        return reject(new Error("Database initialisation with refModel = '" + refModel + "' is already reserved"));
      }

      app[refModel] = {};
      app[refDb] = new Sequelize(
        dbConfig.name,
        dbConfig.username,
        dbConfig.password,
        dbConfig.settings);

      app.helpers.utils.fs.scanDir(modelDir, {}, function(file){
        var filePath = path.join(modelDir, file);
        var container = require(filePath);
        var model;
        var define = function(name){
          return model = app[refModel][name] = app[refDb].define.apply(app[refDb], arguments);
        };

        define.after = function(fn){
          afterFunctions.push(function(){
            fn(model);
          });
        };

        container(define, Sequelize, app);
      }).then(function(){
        _.each(afterFunctions, function(fn){
          return fn();
        });
        isInitialized = true;

        return fulfill(self);
      });
    });
  };

  /**
   * Migrate/update database structure
   * @returns {bluebird}
   */
  var migrate = function(){
    if(!isInitialized){
      return Promise.reject(new Error("Database is not initialized"));
    }else {
      var self = this;
      var modelNames = Object.keys(app[refModel]);

      return Promise.resolve().then(function(){
        return app[refDb].sync();
      }).then(function(){
        return Promise.reduce(modelNames, function (total, modelName) {
          return alterColumns(app[refModel][modelName]);
        }, 0);
      }).then(function () {
        return Promise.reduce(modelNames, function (total, modelName) {
          return alterIndices(app[refModel][modelName]);
        }, 0);
      }).then(function(){
        return self;
      });
      //  .catch(function(err){
      //  return Promise.reject(err);
      //});

      //_.each(modelNames, function(modelName){
      //  innerPromise = innerPromise.then(function(){
      //    return alterColumns(app[refModel][modelName]);
      //  });
      //});
      //
      //tasks.push(function(callback){
      //  app[refDb].sync().complete(function(err){
      //    callback(err);
      //  });
      //});
      //
      //tasks.push(function(callback){
      //  async.eachSeries(modelNames, function(modelName, callback){
      //    alterColumns(app[refModel][modelName], {}, callback);
      //  }, callback);
      //});
      //
      //tasks.push(function(callback){
      //  async.eachSeries(modelNames, function(modelName, callback){
      //    alterIndices(app[refModel][modelName], {}, callback)
      //  }, callback);
      //});
      //
      //tasks.push(fulfill);
      //
      //return async.series(tasks, function(err){
      //  fulfill();
      //})
    }
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

    //var tasks = [];
    //var queryInterface = app[refDb].getQueryInterface();
    //var newIndexes = {};
    //
    //typeof callback !== "function" && (callback = function(){});
    //options = _.extend({}, options);
    //
    //tasks.push(function(callback) {
    //  app[refDb].query("SHOW INDEX FROM `" + model.tableName + "`", {
    //    replacements: {},
    //    raw: true,
    //    type: app[refDb].QueryTypes.SELECT
    //  }).then(function(indexes){
    //    _.each(model.options.indexes, function(index){
    //      if(!_.find(indexes, function(i){
    //        return i.Key_name === index.name;
    //      })){
    //        newIndexes.push(index);
    //      }
    //    });
    //    callback();
    //  });
    //});
    //
    //tasks.push(function(callback){
    //  async.eachSeries(newIndexes, function(index, callback){
    //    queryInterface.addIndex(model.tableName, index.fields, {
    //      indexName: index.name,
    //      indicesType: index.unique ? "UNIQUE" : index.type,  //ToDo: improvement needed,
    //      indexType: index.method
    //    }).complete(callback);
    //  }, callback);
    //});
    //
    //async.series(tasks, callback);
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

    //tasks.push(function(callback){
    //  queryInterface
    //    .describeTable(model.tableName)
    //    .complete(function(err, attributes){
    //      if(err){
    //        return callback(err);
    //      }else{
    //        _.each(model.rawAttributes, function(desc, name) {
    //          if(!attributes[name]){
    //            newColumns[name] = model.rawAttributes[name];
    //          }
    //        });
    //        return callback();
    //      }
    //    });
    //});
    //
    //tasks.push(function(callback){
    //  async.each(Object.keys(newColumns), function(name, callback){
    //    queryInterface.addColumn(Model.tableName, name, newColumns[name]).complete(callback);
    //  }, callback);
    //});
    //
    //return async.series(tasks, callback);
  };

  var alterPrimaryKey = function(model, options, callback){
    var tasks = [];

    options = _.extend({}, options);
  };

  return {
    initialize: initialize,
    migrate: migrate
  };
};

module.exports = Database;