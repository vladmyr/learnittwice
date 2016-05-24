'use strict';

const _ = require('underscore');
const config = require('config');
const Alias = require('require-alias');

/**
 * Generates paths' aliases
 * @param   {Object}  configPaths paths to process
 * @param   {String}  [keyPrefix]
 * @returns {Object}
 */
const generateRequireAliases = (configPaths, keyPrefix) => {
  keyPrefix = keyPrefix || '';

  return _.reduce(configPaths, (stack, configPath, key) => {
    if (typeof configPath == 'object') {
      _.extend(stack, generateRequireAliases(configPath, `${keyPrefix}${key}.`));
    } else if (typeof configPath == 'string') {
      stack[`@${keyPrefix}${key}`] = configPath;
    }

    return stack;
  }, {});
};

module.exports = (confg) => {
  return Promise.resolve().then(() => {
    config.dir.root = __dirname;

    /** make require aliases accessible globally */
    global.alias = new Alias({
      aliases: generateRequireAliases({ dir: config.dir, file: config.file })
    });
  })
};