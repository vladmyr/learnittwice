"use strict";

const Promise = require("bluebird");
const path = require("path");

/**
 * Main mongodb database initialization
 * @param   {Application} app
 * @returns {Promise}
 * @constructor
 */
class DatabaseMongoInitializer {
  constructor(app) {
    const DatabaseMongo = require(path.join(app.config.dir.root, app.config.file.domain.databaseMongo));
    const databaseMongo = new DatabaseMongo(app, app.config,
      path.join(app.config.dir.root, app.config.dir.models),
      "dbMongo",
      "modelsMongo");

    return databaseMongo.initialize();

    //return databaseMongo.initialize().then((data) => {
    //  const lemma = new app.modelsMongo.Lemma({
    //    lemma: "car"
    //  });
    //
    //  lemma.save();
    //
    //  return data
    //});
  }
}

module.exports = DatabaseMongoInitializer;