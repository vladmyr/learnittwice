"use strict";

const url = require("url");
const Promise = require("bluebird");
const mongoose = require("mongoose");

/**
 * Mongodb database connector constructor
 * @param app
 * @param dbConfig
 * @param modelDir
 * @param refDb
 * @param refModel
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
      : "db";
    self.refModel = refModel
      ? refModel
      : "models";
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

    return new Promise(function(fulfill, reject){
      // check whether database reference is occupied
      if(typeof self.app[self.refDb] !== "undefined"){
        return reject(new Error("Database initialisation with refDb = '" + self.refDb + "' is already reserved"));
      }

      // check whether database models' reference is occupied
      if(typeof self.app[self.refModel] !== "undefined"){
        return reject(new Error("Database initialisation with refModel = '" + self.refModel + "' is already reserved"));
      }

      if(typeof self.app.mongoose === "undefined"){
        self.app.mongoose = mongoose;
      }

      // open connection
      self.app.mongoose.connect(self.dbConfig.database_mongo.uri, self.dbConfig.database_mongo.options);

      self.app[self.refModel] = {};
      // map connection reference
      self.app[self.refDb] = self.app.mongoose.connection;

      self.app[self.refDb].on("error", reject);
      self.app[self.refDb].once("open", fulfill);
    });
  }
}

module.exports = DatabaseMongo;