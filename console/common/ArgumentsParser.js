"use strict";

const _ = require("underscore");

/**
 * Console arguments parser class
 */
class ArgumentsParser {
  /**
   * Constructor
   * @param {Array.<Object>}  argsCfg - list of recognizable arguments
   * @param {Object}          [options]
   */
  constructor(argsCfg, options) {
    let self = this;

    self.listeners = {};
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
   * Add action listener
   * @param {String}    action
   * @param {Function}  fn
   */
  addListener(action, fn) {
    let self = this;

    _.isEmpty(self.listeners[action]) && (self.listeners[action] = []);
    self.listeners[action].push(fn);
  }

  /**
   * Notify subscribers about the action
   * @param {String}        action
   * @param {Array.<Mixed>} [params]
   */
  notify(action, params) {
    let self = this;
    _.each(self.listeners[action] || [], (fn) => fn.apply(self, params));
  }

  /**
   * Parse arguments
   * @param {String} args
   * @param {Object} [options]
   */
  parse(args, options) {
    let self = this;
    let parsed = {};

    _.each(args, (arg) => {
      let argSplit = arg.split(self.options.delimiter);

      argSplit[0] = argSplit[0].replace(self.options.prefix, "");

      let argCfg = self.argsCfg[argSplit[0]];

      if (_.isEmpty(argCfg)) {
        // argument is not recognized - skip it
        self.notify(ArgumentsParser.ACTION.NOT_RECOGNIZED, [argSplit[0]]);
      } else {
        if (argCfg.type === ArgumentsParser.TYPE.BOOLEAN) {
          // is boolean type arguments
          parsed[argSplit[0]] = !argCfg.defValue;
        } else {
          // is valued type arguments
          if (_.findIndex(argCfg.values, (value) => new RegExp(value).test(argSplit[1])) === -1) {
            // value of the argument is not valid - skip it
            self.notify(ArgumentsParser.ACTION.NOT_VALID, [argSplit[0], argSplit[1]]);
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

// keyword static is not yet supported (as for node 5.7.1)
/** Available parse actions */
ArgumentsParser.ACTION = {
  NOT_RECOGNIZED: "NOT_RECOGNIZED",
  NOT_VALID: "NOT_VALID"
};
/** Available types for argument configuration */
ArgumentsParser.TYPE = {
  BOOLEAN: "BOOLEAN",
  VALUED: "VALUED"
};

module.exports = ArgumentsParser;