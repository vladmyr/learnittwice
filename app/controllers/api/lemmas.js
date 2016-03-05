"use strict";

var Promise = require("bluebird");

/**
 * Lemmas controller
 * @param   {express.Router}  router
 * @param   {Application}     app
 * @module
 */
module.exports = function(router, app){
  app.Util.express.defineController({
    setup: function(){
      router.path = "lemmas";
      router
        .get("/", this.getLemmas)
        .get("/hello", this.getHelloWorldJSON)
    },
    getHelloWorldJSON: function(req, res, next) {
      return res.json("hello, this is lemmas!");
    },
    getLemmas: function(req, res, next) {
      return Promise.resolve().then(function(){
        return app.models.Lemma.findAll(app.Util.model.normalizeQueryOptions({}))
      }).then(function(lst){
        return res.json(lst);
      })
    }
  })
};