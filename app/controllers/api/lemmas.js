"use strict";

/**
 * Lemmas controller
 * @param   {express.Router}  router
 * @param   {Application}     app
 * @module
 */
module.exports = function(router, app){
  app.Util.express.defineController(router, {
    setup: function(router){
      router.path = "lemmas";
      router
        .get("/", this.getHelloWorldJSON)
    },
    getHelloWorldJSON: function(req, res, next){
      return res.json("hello, this is lemmas!");
    }
  })
};