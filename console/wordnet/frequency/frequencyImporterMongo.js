"use strict";

const Promise = require("bluebird");
const _ = require("underscore");
const path = require("path");

class FrequencyImporterMongo {
  constructor(app, options) {
    let self = this;

    self.app = app;
    self.options = _.defaults({

      source: path.join(__dirname, "./source/20k.txt")
    }, options || {})
  }
  import() {
    let self = this;

    return self.app.Util.Fs.readFileByLine(self.options.source, (line) => {

    });
  }
}

module.exports = (app, args) => {
  return Promise
    .resolve()
    .import();
};