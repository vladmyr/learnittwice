'use strict';

// external dependencies
const Promise = require('bluebird');
const _ = require('underscore');
const path = require('path');

// custom dependencies
const LANGUAGE = alias.require('@file.const.language');
const MEDIA_TYPE = alias.require('@file.const.mediaType');
const VIEW_TEMPLATE = alias.require('@file.const.mediaType');
const WORDFORM = alias.require('@file.const.wordform');
const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

const Util = alias.require('@file.helpers.util');
const Timer = alias.require('@file.helpers.timer');
const ENV = alias.require('@file.const.env');

const MiddlewareInitializer = alias.require('@file.init.middleware');
const DatabaseMongoInitializer = alias.require('@file.init.databaseMongo');
const ExpressInitializer = alias.require('@file.init.express');
const ServiceInitializer = alias.require('@file.init.service');

/**
 * Server application initialization class
 * @param       {Object}  options configuration options
 * @returns     {Application}
 * @typedef     {Object}  Application
 * @constructor
 */
class Application {
  constructor (config) {
    let self = this;

    self.ENV = ENV;
    self.LANGUAGE = LANGUAGE;
    self.MEDIA_TYPE = MEDIA_TYPE;
    self.VIEW_TEMPLATE = VIEW_TEMPLATE;
    self.WORDFORM = WORDFORM;
    self.HTTP_STATUS_CODE = HTTP_STATUS_CODE;

    self.env = ENV.DEVELOPMENT;
    self.config = config;
    self.expressApps = [];
    self.Util = Util;
    self.Timer = Timer.getInstance();
    self.services = {};

    // object construction for each express entryPoint
    _.each(self.config.entryPoints, function(entryPoint){
      self[entryPoint.alias] = {};
    });
  }

  /**
   * Initialize application instance
   * @memberOf Application
   * @return {Promise}
   */
  initialize () {
    let self = this;

    return Promise.resolve().then(() => {
      return new ServiceInitializer(self);
    }).then(() => {
      // initialize middleware
      return new MiddlewareInitializer(self);
    }).then(() => {
      // initialize mongodb database
      return new DatabaseMongoInitializer(self);
    }).then(() => {
      // initialize express
      return new ExpressInitializer(self);
    }).then(() => {
      return self;
    });
  }
}

module.exports = Application;