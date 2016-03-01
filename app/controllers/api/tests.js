"use strict";

/**
 * Tests controller
 * @param   {express.Router}  router
 * @param   {Application}     app
 * @module
 */
module.exports = function(router, app){
  app.Util.express.defineController({
    setup: function(){
      router.path = "tests";
      router
        .get("/", this.getJSON)
    },
    getJSON: function(req, res, next){
      return res.json({
        key: "value"
      });
    }
  })
};