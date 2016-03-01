"use strict";

var Promise = require("bluebird");
var path = require("path");

/**
 * Root of controller hierarchy for API route controllers
 * @param   {Object}          entryPoint
 * @param   {express.Router}  router
 * @param   {Application}     app
 * @returns {Promise}
 * @module
 */
module.exports = function(entryPoint, router, app){
  var ENV = require(path.join(app.config.dir.root, app.config.file.const.env));

  return Promise.resolve().then(function() {

    // place to implement routing logic, authentication, etc.
    router.use(function (req, res, next) {
      // cross origin requests
      if (app.env === ENV.DEVELOPMENT) {
        // development environment
        return next();
      } else {
        // non-development environment
        if (app.middleware.CrossDomain.isOriginAllowed(entryPoint.get("allowedHosts"), req.headers.origin)) {
          app.middleware.CrossDomain.setResponseHeaders(req, res);
          return next();
        } else {
          return res.status(403).send();
        }
      }
    });

    return router;
  }).then(function(router){
    // load each controller
    return app.Util.express.loadAllNestedControllers(path.join(app.config.dir.root, entryPoint.dir.controller), entryPoint.file.entryController, router, app);
  }).then(function(router){
    // 404 route
    router.use("*", function (req, res, next) {
      res.status(404).json({
        error: {
          message: 'No route for ' + req.baseUrl
        }
      });
    });

    return router;
  });
};