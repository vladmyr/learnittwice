"use strict";

var Promise = require("bluebird");
var path = require("path");

module.exports = function(entryPoint, router, app){
  return Promise.resolve().then(function(){
    router.use(function(req, res, next){
      return next();
    });

    return router;
  }).then(function(router){
    return app.helpers.utils.express.loadAllNestedControllers(path.join(app.root_dir, entryPoint.controllerDir), entryPoint.mainControllerName, router, app);
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