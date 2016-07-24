"use strict";

const Promise = require('bluebird');
const Util = alias.require('@file.helpers.util');

/**
 * Tests controller
 * @param   {express.Router}  router
 * @param   {Application}     app
 * @module
 */
module.exports = function(router, app){
  app.Util.Express.defineController({
    setup: function(){
      router.path = "tests";
      router
        .get("/", this.getJSON)
    },
    getJSON: function(req, res, next){
      return Promise.resolve().then(() => {
        return app.models.Language.find();
      }).then((find) => {
        return res.json(Util.Mongoose.mapToObject(find));
      });
    }
  })
};