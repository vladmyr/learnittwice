"use strict";

var path = require("path");
/**
 * Main database initialization
 * @param   {Application} app
 * @returns {Promise}
 */

// TODO - refactoring
var DatabaseInitializer = function(app){
  return new require(path.join(app.root_dir, app.config.dir.domain, app.config.filePath.domain.database))(app)
    .initialize()
    .then(function(self){
      return self.migrate();
    })
    //ToDo: postQueries.sql prevent altering `sense` table if it was done already
    //.then(function(self){
    //  return self.executeRawQueriesFromFile(path.join(
    //    app.root_dir,
    //    app.config.dir.domain,
    //    app.config.dir.databaseQueries,
    //    app.config.filePath.domain.databaseQueries.postQueries));
    //})
    .then(function(){
      return callback();
    }).catch(function(err){
      return callback(err);
    });
};

module.exports = DatabaseInitializer;