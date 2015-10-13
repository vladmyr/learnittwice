"use strict";

module.exports = function(router, app){
  app.helpers.utils.express.defineController(router, {
    setup: function(router){
      router.path = "/";
      router
        .get("/", this.getHome)
    },
    getHome: function(req, res, next){
      return res.json("Hello, Admin!");
    }
  })
};