"use strict";

module.exports = function(router, app){
  app.helpers.utils.express.defineController(router, {
    setup: function(router){
      router.path = "courses";
      router
        .get("/", this.getHelloWorldJSON)
    },
    getHelloWorldJSON: function(req, res, next){
      return res.json("hello world!");
    }
  })
};