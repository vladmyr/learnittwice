"use strict";

module.exports = function(router, app){
  app.helpers.utils.express.defineController(router, {
    setup: function(router){
      router.path = "dictionary";
      router
        .get("/list.json", this.listJSON)
        .get("/list", this.list);
    },
    listJSON: function(req, res, next){
      var json = {};
      return app.services.admin.dictionary.listAll(json).then(function(lst){
        return res.json(lst);
      });
    },
    list: function(req, res, next){
      return res.render("dictionary/list");
    }
  });
};