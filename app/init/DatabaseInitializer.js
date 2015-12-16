"use strict";

// external dependencies
var Promise = require("bluebird");
var path = require("path");

/**
 * Main database initialization
 * @param   {Application} app
 * @param   {Function}    [callback]
 * @returns {Promise}
 * @constructor
 */
var DatabaseInitializer = function(app, callback){
  // load application dependencies
  var Database = require(path.join(app.config.dir.root, app.config.file.domain.database));

  // create database instance
  var database = new Database(app);

  return Promise.resolve().then(function(){
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