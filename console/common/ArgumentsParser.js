"use strict";

const _ = require("underscore");

/**
 * Console arguments parser class
 */
class ArgumentsParser {
  /** Available parse actions */
  static ACTION = {
    NOT_RECOGNIZED: 0,
    NOT_VALID: 1
  };

  /** Available types for argument configuration */
  static TYPE = {
    BOOLEAN: 0,
    VALUED: 1
  };

  /**
   * Constructor
   * @param {Array.<Object>}  argsCfg - list of recognizable arguments
   * @param {Object}          [options]
   */
  constructor(argsCfg, options) {
    let self = this;

    self.options = _.extend({
      prefix: "--",
      delimiter: ":"
    }, options);
    self.argsCfg = {};

    // init argsCfg
    _.each(argsCfg, (value, key) => {
      value = _.extend({}, {
        type: ArgumentsParser.TYPE.BOOLEAN, // type of specified argument
        defValue: false,                    // default value
        values: [true, false]               // available values
      }, value);

      self.argsCfg[key] = value;
    });
  }

  /**
   * Parse arguments
   * @param {String} args
   * @param {Object} [options]
   */
  parse(args, options) {
    let self = this;
    let argsSplit = args.split(/\s/);
    let parsed = {};

    _.each(argsSplit, (arg) => {
      let argSplit = arg.split(self.options.delimiter);

      argSplit[0] = argSplit[0].replace(self.options.prefix, "");

      let argCfg = self.argsCfg[argSplit[0]];

      if (_.isEmpty(argCfg)) {
        // argument is not recognized - skip it
      } else {
        if (argCfg.type === ArgumentsParser.TYPE.BOOLEAN) {
          // is boolean type arguments
          parsed[argSplit[0]] = !argCfg.defValue;
        } else {
          // is valued type arguments
          if (argCfg.values.indexOf(argSplit[1]) === -1) {
            // value of the argument is not valid - skip it
          } else {
            // value is valid
            parsed[argSplit[0]] = argSplit[1];
          }
        }
      }
    });

    return parsed;
  }
}

module.exports = ArgumentsParser;