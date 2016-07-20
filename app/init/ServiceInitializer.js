'use strict';

// external dependencies
const Promise = require('bluebird');
const _ = require('underscore');
const path = require('path');

const Util = alias.require('@file.helpers.util');

/**
 * Service initialization class
 * @param {Application} app
 * @constructor
 */
class ServiceInitializer {
  constructor(app) {
    let dir = path.join(app.config.dir.root, app.config.dir.services);

    return Util.Fs.scanDir(dir, (file, basename) => {
      let container = require(path.join(dir, file));
      app.services[basename] = new container(app);
    })
  }
}

module.exports = ServiceInitializer;