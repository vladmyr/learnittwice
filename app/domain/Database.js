"use strict";

var _ = require("underscore");
var path = require("path");
var Sequelize = require("sequelize");

/**
 * Database management class
 * @param app
 * @returns {{initialize: Function}}
 * @constructor
 */
var Database = function(app){
  /**
   * Initialize database connection and DAO
   * @param {object} dbConfig
   * @param {string} modelDir
   * @param {string} refDb
   * @param {string} refModel
   * @param {function} callback
   * @returns {*}
   */
  var initialize = function(dbConfig, modelDir, refDb, refModel, callback){
    var afterFunctions = [];

    //initialize defaults
    !dbConfig && (dbConfig = app.config.database);
    !modelDir && (modelDir = path.join(app.root_dir, app.config.dir.models));
    !refDb && (refDb = "db");
    !refModel && (refModel = "models");

    if(typeof app[refDb] !== "undefined"){
      return callback && callback(new Error("Database initialisation with refDb = '" + refDb + "' is already reserved"));
    }

    if(typeof app[refModel] !== "undefined"){
      return callback && callback(new Error("Database initialisation with refModel = '" + refModel + "' is already reserved"));
    }

    app[refDb] = {};
    app[refModel] = {};

    app[refDb] = new Sequelize(
      dbConfig.name,
      dbConfig.username,
      dbConfig.password,
      dbConfig.settings);

    app.helpers.utils.fs.scanDirSync(modelDir, {}, function(file){
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
    });

    _.each(afterFunctions, function(fn){
      return fn();
    });

    return callback && callback();
  };

  return {
    initialize: initialize
  };
};

module.exports = Database;