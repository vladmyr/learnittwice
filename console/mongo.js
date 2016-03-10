"use strict";

const spawn = require("child_process").spawn;
const ArgumentsParser = require("./common/ArgumentsParser");

class Mongo extends ArgumentsParser {
  constructor(app, argsCfg, options) {
    this.app = app;
    this.argsCfg = argsCfg;
    this.options = options;

    super(argsCfg, options);
  }
  execute(args) {

  }
}

module.exports = (app, args, callback) => {
  let mongoArgsCfg = {
    dump: {
      type: ArgumentsParser.Type.BOOLEAN
    },
    restore: {

    }
  };
  let mongo = new Mongo(app, mongoArgsCfg)
};