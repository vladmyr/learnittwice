"use strict";

var path = require("path"),
  Sequelize = require("sequelize");

var DatabaseInitializer = function(app, callback){
  app.db = new Sequelize(
    app.config.database.name,
    app.config.database.username,
    app.config.database.password,
    app.config.database.settings);

  app.helpers.utils.scanDirSync(app.config.dir.models, [], function(file){
    var model = app.db["import"](app.config.dir.models, file);
    app.models[model.name] = model;
  });

  Object.keys(app.models).forEach(function(modelName){
    if("associate" in app.models[modelName]){
      app.models[modelName].associate(app.models);
    }
  });

  callback && callback();
};

module.exports = DatabaseInitializer;