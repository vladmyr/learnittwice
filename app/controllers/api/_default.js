'use strict';

const ENV = alias.require('@file.const.env');
const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

const Promise = require('bluebird');
const path = require('path');

const Util = alias.require('@file.helpers.util');

/**
 * Root of controller hierarchy for API route controllers
 * @param   {Object}          entryPoint
 * @param   {express.Router}  router
 * @param   {Application}     app
 * @returns {Promise}
 * @module
 */
module.exports = (entryPoint, router, app) => {
  return Promise.resolve().then(() => {
    // place to implement routing logic, authentication, etc.
    router.use(function (req, res, next) {
      Util.Express.extendRequest(req);

      // cross origin requests
      if (app.env === ENV.DEVELOPMENT) {
        // development environment
        app.middleware.CrossDomain.setResponseHeaders(req, res);
        return next();
      } else {
        // non-development environment
        if (app.middleware.CrossDomain.isOriginAllowed(entryPoint.get('allowedHosts'), req.headers.origin)) {
          app.middleware.CrossDomain.setResponseHeaders(req, res);
          return next();
        } else {
          return res.status(HTTP_STATUS_CODE.FORBIDDEN).send();
        }
      }
    });

    return router;
  }).then((router) => {
    // load each controller
    return app.Util.Express.loadAllNestedControllers(path.join(app.config.dir.root, entryPoint.dir.controller), entryPoint.file.entryController, router, app);
  }).then((router) => {
    // 404 route
    router.use('*', (req, res, next) => {
      app.Util.Express.respond(res, app.HTTP_STATUS_CODE.NOT_FOUND, `No route for ${req.baseUrl}`)
    });

    return router;
  });
};