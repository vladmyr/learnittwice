"use strict";

/**
 * Script to initialize and seed MongoDB database
 * @module
 */

const path = require("path");
const Promise = require("bluebird");

module.exports = (app, args, callback) => {
  const container = require(path.join(
    app.config.dir.root,
    app.config.file.db.mongo.populate
  ));

  return Promise.resolve().then(() => {
    return container(app);
  }).then(() => {
    return callback();
  }).catch((err) => {
    return callback(err);
  })
};