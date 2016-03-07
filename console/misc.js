"use strict";

const Promise = require("bluebird");
const fs = require("fs");
const path = require("path");

/**
 * Used just for testing different stuff
 * @param app
 * @param args
 * @param callback
 * @returns {*}
 */
module.exports = (app, args, callback) => {
  console.log(app.LANGUAGE);
  console.log(app.LANGUAGE.ENGLISH);
  console.log(app.LANGUAGE.ENGLISH.SHORT);
  return callback();
};