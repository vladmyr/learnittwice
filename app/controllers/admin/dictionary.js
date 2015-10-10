"use strict";

module.exports = function(router, app){
  app.helpers.utils.express.defineController(router, {
    setup: function(router){
      router.get("list.json", this.listJSON);
    },
    listJSON: function(req, res, next){

    }
  })
};