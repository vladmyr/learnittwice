"use strict";

module.exports = function(router, app){
  app.helpers.utils.express.defineController(router, {
    setup: function(router){
      router.path = "dictionary";
      router
        .get("/list.json", this.listJSON);
    },
    listJSON: function(req, res, next){
      return app.services.admin.dictionary.listAll().then(function(lst){
        return res.json(lst);
      })
    }
  });
};