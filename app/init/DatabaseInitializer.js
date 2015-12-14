"use strict";

var Promise = require("bluebird");
var path = require("path");
/**
 * Main database initialization
 * @param   {Application} app
 * @param   {Function}    [callback]
 * @returns {Promise}
 */

var DatabaseInitializer = function(app, callback){
  return Promise.resolve().then(function(){
    // create database instance
    return new require(path.join(app.config.dir.root, app.config.file.domain.database))(app);
  }).then(function(database){
    // initialize instance
    return database.initialize();
  }).then(function(database){
    // migrate
    return database.migrate();
  })
  //ToDo - postQueries.sql prevent altering `sense` table if it was done already
  //.then(function(database){
  //  return self.executeRawQueriesFromFile(path.join(
  //    app.root_dir,
  //    app.config.dir.domain,
  //    app.config.dir.databaseQueries,
  //    app.config.filePath.domain.databaseQueries.postQueries));
  //})
  .nodeify(callback);
};

module.exports = DatabaseInitializer;