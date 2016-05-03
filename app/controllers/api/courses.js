"use strict";

/**
 * Courses controller
 * @param   {express.Router}  router
 * @param   {Application}     app
 * @module
 */
module.exports = function(router, app){
  app.Util.Express.defineController({
    setup: function(){
      router.path = "courses";
      router
        .get("/", this.getHelloWorldJSON)
    },
    getHelloWorldJSON: function(req, res, next){
      return res.json("hello world!");
    }
  })
};