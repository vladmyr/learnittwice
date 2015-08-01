"use strict";

var _ = require("underscore"),
  path = require("path"),
  Sequelize = require("sequelize");

var DatabaseInitializer = function(app, callback){
  var modelDir = path.join(app.root_dir, app.config.dir.models);
  var afterFunctions = [];

  app.db = new Sequelize(
    app.config.database.name,
    app.config.database.username,
    app.config.database.password,
    app.config.database.settings);

  app.helpers.utils.scanDirSync(modelDir, {
    includes: ["Word.js"]
  }, function(file){
    var filePath = path.join(modelDir, file);
    var container = require(filePath);
    var model;
    var define = function(name){
      return model = app.models[name] = app.db.define.apply(app.db, arguments);
    };

    define.after = function(fn){
      afterFunctions.push(function(){
        fn(model);
      });
    };

    container(define, Sequelize, app);
    //var model = app.db["import"](app.config.dir.models, file);
    //app.models[model.name] = model;
  });

  _.each(afterFunctions, function(f){
    return f();
  });

  //Object.keys(app.models).forEach(function(modelName){
  //  if("associate" in app.models[modelName]){
  //    app.models[modelName].associate(app.models);
  //  }
  //});

  return callback && callback();
};

module.exports = DatabaseInitializer;