'use strict';

const path = require('path');
const Promise = require('bluebird');
const mongoose = require('mongoose');

/**
 * Mongodb database connector constructor
 * @param   {Applicaton}  app
 * @param   {Object}      dbConfig
 * @param   {String}      modelDir
 * @param   {String}      refDb
 * @param   {String}      refModel
 * @returns {DatabaseMongo}
 * @typedef {Object}  DatabaseMongo
 * @constructor
 */
class DatabaseMongo {
  constructor(app, dbConfig, modelDir, refDb, refModel) {
    const self = this;

    self.app = app;
    self.dbConfig = dbConfig
      ? dbConfig
      : self.app.config.database;
    self.modelDir = modelDir
      ? modelDir
      : self.modelDir = path.join(self.app.config.dir.root, self.app.config.dir.models);
    self.refDb = refDb
      ? refDb
      : 'db';
    self.refModel = refModel
      ? refModel
      : 'models';
    self.isInitialized = false;
    self.logger = null;
    self.loggerTransports = [];

    // initialize logging
    // TODO - fix
    //!self.app.config.db.isEnabledFileLogging && (self.loggerTransports.push(
    //  new (winston.transports.File)({
    //    filename: path.join(self.app.config.dir.root, self.app.config.file.log.db),
    //    json: false
    //  })
    //));
    //!self.app.config.db.isEnabledConsoleLogging && (self.loggerTransports.push(
    //  new (winston.transports.Console)()
    //));
  }
  /**
   * Initialize ODM
   * @returns {Promise}
   */
  initialize() {
    const self = this;

    return new Promise((fulfill, reject) => {
      // connect to mongodb database
      // check whether database reference is occupied
      if(typeof self.app[self.refDb] !== 'undefined'){
        return reject(new Error('Database initialisation with refDb = "' + self.refDb + '" is already reserved'));
      }

      // check whether database models' reference is occupied
      if(typeof self.app[self.refModel] !== 'undefined'){
        return reject(new Error('Database initialisation with refModel = "' + self.refModel + '" is already reserved'));
      }

      if(typeof self.app.mongoose === 'undefined'){
        self.app.mongoose = mongoose;
      }

      // turn on debugging in development environment
      if(self.app.env === self.app.ENV.DEVELOPMENT) {
        self.app.mongoose.set('debug', true);
      }

      // open connection
      self.app.mongoose.connect(self.dbConfig.database_mongo.uri, self.dbConfig.database_mongo.options);

      self.app[self.refModel] = {};
      // set connection reference
      self.app[self.refDb] = self.app.mongoose.connection;

      self.app[self.refDb].on('error', reject);
      self.app[self.refDb].once('open', fulfill);
    }).then(() => {
      let scanDirOptions = {
        excludes: [path.basename(self.app.config.dir.modelsMongoNested)]
      };

      // initialize mongoose models
      return self.app.Util.Fs.scanDir(self.modelDir, scanDirOptions, (file, basename) => {
        const filePath = path.join(self.modelDir, file);
        const modelContainer = require(filePath);

        self.app[self.refModel][basename] = modelContainer(
          self.app.Util.Mongoose.define(self.app),
          self.app.Util.Mongoose.defineSchema(self.app),
          self.app.mongoose.Schema.Types, self.app);
      });
    });
  }
}

module.exports = DatabaseMongo;