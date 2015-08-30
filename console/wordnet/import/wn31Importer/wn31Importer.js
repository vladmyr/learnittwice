"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");

var wn31Importer = function(app, options){
  var promise = Promise.resolve();
  var options = _.extend({
    database: {
      name: "wordnet"
    },
    modelDir: path.join(__dirname, "models"),
    refDb: "dbWn",
    refModel: "modelsWn"
  }, options);

  var dbInstance = new require(path.join(app.root_dir,
    app.config.dir.domain,
    app.config.filePath.domain.database))(app, {
    name: options.database.name,
    username: app.config.database.username,
    password: app.config.database.username,
    settings: app.config.database.settings
  }, options.modelDir, options.refDb, options.refModel);

  return promise.then(function(){
    console.log("Initializing database connection....")
    return dbInstance.initialize().then(function(){
      return console.log("Done!");
    });
  }).then(function(){
    return app[options.refModel].Word.find({
      where: {
        wordid: 1
      }
    });
  }).then(function(word){
    return word;
  }).catch(function(err){
    return Promise.reject(err);
  });
};

module.exports = function(app, args, callback){
  console.log("Running wn31Importer...");
  return wn31Importer(app)
    .then(function(){
      return console.log("All tasks are done!")
    })
    .then(function(){
      return callback();
    })
    .catch(function(err){
      return callback(err);
    });
};