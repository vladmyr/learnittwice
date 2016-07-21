'use strict';

const Promise = require('bluebird');
const path = require('path');

const DB_REF = 'dbMongo';
const MODELS_REF = 'models';

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
      path.join(app.config.dir.root, app.config.dir.modelsMongo),
      DB_REF,
      MODELS_REF);

    return databaseMongo.initialize();
  }
}

module.exports = DatabaseMongoInitializer;