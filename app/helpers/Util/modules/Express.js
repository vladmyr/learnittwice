'use strict';

const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

const config = require('config');
const _ = require('underscore');
const Promise = require('bluebird');
const path = require('path');
const express = require('express');
const url = require('url');

const Fs = require('./Fs');
const extendRequest = require('./Express.extendRequest');

class Express {
  /**
   * Define new route controller
   * @param controller
   */
  static defineController (controller){
    _.defaults(controller, {
      bind: function(method){
        return this[method].bind(this);
      }
    });

    return controller.setup();
  }

  /**
   * Load controller hierarchy
   * @param entryPoint
   * @param router
   * @param app
   * @returns {Object}  container that hold controller`s logic
   */
  static loadControllerHierarchy (entryPoint, router, app) {
    // container for entry controller
    let container = require(path.join(app.config.dir.root, entryPoint.file.entryController));
    return container(entryPoint, router, app);
  }

  /**
   *
   * @param container
   * @param router
   * @param app
   * @returns {express.Router}
   */
  static loadOneNestedController (container, router, app) {
    if(typeof container == "string"){
      container = require(path.join(app.config.dir.root, container));
    }
    container(router, app);
    return router;
  }

  /**
   * Load all nested controllers of entry controller for express entry point
   * @param   {String}                  pathDir   controllers` parent directory
   * @param   {String|Array<String>}    exclude   controllers` file names that must be excluded
   * @param   {express.Router}          router    express application router
   * @param   {Application}             app
   * @returns {Promise}
   */
  static loadAllNestedControllers(pathDir, exclude, router, app) {
    return Promise.resolve().then(function(){
      // scan controller's parent directory
      return Fs.scanDir(pathDir, { excludes: Array.isArray(exclude)
        ? exclude
        : [exclude]
      } , function(file, basename){
        var filePath = path.join(pathDir, basename);
        var container = require(filePath);  // controller's container

        // load controller's container into a separate router
        var nestedRouter = Express.loadOneNestedController(container, express.Router(), app);

        // if controller nester route was not specified set one according to basename
        var root = nestedRouter.path || basename;
        _.each((Array.isArray(root)
            ? root
            : [root]
        ), function(routePath){
          routePath = url.resolve("/", routePath);
          // attach controller's router into express router
          router.use(routePath, nestedRouter);
        });
      });
    }).then(function(){
      return router;
    });
  }

  /**
   * Maps allowed hosts
   * @param   {Array<Object>} hosts
   * @returns {Array<String>}
   */
  static mapAllowedHosts (hosts) {
    return _.map(hosts || [], function(item){
      return url.format(item);
    })
  }

  /**
   * Send response
   * @param {express.Response}  res
   * @param {Number}            code
   * @param {Object|String}     data
   */
  static respond(res, code, data) {
    // See https://google.github.io/styleguide/jsoncstyleguide.xml for details
    let json = {};

    if (code === HTTP_STATUS_CODE.OK) {
      // success
      json = _.extend({}, json, {
        data: data
      })
    } else {
      if (typeof data.toString !== "undefined") {
        data = data.toString();
      }

      json = _.extend({}, json, {
        error: {
          code: code,
          message: data
        }
      })
    }

    return res.status(code).json(json);
  }
}

Express.extendRequest = extendRequest;

module.exports = Express;