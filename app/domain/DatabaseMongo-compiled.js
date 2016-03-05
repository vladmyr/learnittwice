"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var url = require("url");
var Promise = require("bluebird");
var mongoose = require("mongoose");

/**
 * Mongodb database connector constructor
 * @param app
 * @param dbConfig
 * @param modelDir
 * @param refDb
 * @param refModel
 * @constructor
 */

var DatabaseMongo = (function () {
  function DatabaseMongo(app, dbConfig, modelDir, refDb, refModel) {
    _classCallCheck(this, DatabaseMongo);

    var self = this;

    self.app = app;
    self.dbConfig = dbConfig ? dbConfig : self.app.config.database;
    self.modelDir = modelDir ? modelDir : self.modelDir = path.join(self.app.config.dir.root, self.app.config.dir.models);
    self.refDb = refDb ? refDb : "db";
    self.refModel = refModel ? refModel : "models";
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

  _createClass(DatabaseMongo, [{
    key: "initialize",
    value: function initialize() {
      var self = this;

      return new Promise(function (fulfill, reject) {
        // check whether database reference is occupied
        if (typeof self.app[self.refDb] !== "undefined") {
          return reject(new Error("Database initialisation with refDb = '" + self.refDb + "' is already reserved"));
        }

        // check whether database models' reference is occupied
        if (typeof self.app[self.refModel] !== "undefined") {
          return reject(new Error("Database initialisation with refModel = '" + self.refModel + "' is already reserved"));
        }

        if (typeof self.app.mongoose === "undefined") {
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
  }]);

  return DatabaseMongo;
})();

module.exports = DatabaseMongo;

//# sourceMappingURL=DatabaseMongo-compiled.js.map