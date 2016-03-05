"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require("bluebird");
var path = require("path");

/**
 * Main mongodb database initialization
 * @param   {Application} app
 * @returns {Promise}
 * @constructor
 */

var DatabaseMongoInitializer = function DatabaseMongoInitializer(app) {
  _classCallCheck(this, DatabaseMongoInitializer);

  var DatabaseMongo = require(path.join(app.config.dir.root, app.config.file.domain.databaseMongo));
  var databaseMongo = new DatabaseMongo(app, app.config, app.config.dir.modelsMongo, "dbMongo", "modelsMongo");

  return databaseMongo.initialize();
};

module.exports = DatabaseMongoInitializer;

//# sourceMappingURL=DatabaseMongoInitializer-compiled.js.map