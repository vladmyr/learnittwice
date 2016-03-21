"use strict";

const Promise = require("bluebird");
const _ = require("underscore");

/**
 * Lemmas controller
 * @param   {express.Router}  router
 * @param   {Application}     app
 * @module
 */
module.exports = function(router, app){
  app.Util.express.defineController({
    setup: function(){
      let self = this;

      router.path = "lemmas";
      router
        // Public API
        .get("/", self.getLemmas)
        .get("/:language", self.getLemmas)
        .get("/:language/:lemma", self.getLemma)
        // TODO - implement
        //.get("/:language/:lemma/synonyms");
        //.get("/:language/:lemma/translate/:translate");

      router.param("lemma", self.paramLemma);
      router.param("language", self.paramLanguage);
      router.param("translate", self.paramLanguage);
    },
    paramLanguage (req, res, next, lng) {
      return _.toArray(app.LANGUAGE).indexOf(lng) !== -1
        ? next()
        : app.Util.express.respond(res, app.Util.HTTP_STATUS_CODE.BAD_REQUEST, "Language is not found");
    },
    paramLemma (req, res, next, lemma) {
      return !_.isEmpty(lemma)
        ? next()
        : app.Util.express.respond(res, app.Util.HTTP_STATUS_CODE.BAD_REQUEST, "Lemma is not specified");
    },
    getLemmas(req, res, next) {
      let options = {
        offset: req.query.offset,
        limit: req.query.limit
      };

      return Promise
        .resolve()
        .then(() => {
          return app.modelsMongo.Lemma.findAll(options)
        })
        .then((lst) => {
          return app.Util.express.respond(
            res,
            app.Util.HTTP_STATUS_CODE.OK,
            app.Util.modelMongo.mapToObject(lst)
          )
        })
    },
    getLemma(req, res, next) {
      return Promise
        .resolve()
        .then(() => {
          return app.modelsMongo.Lemma.findByLemma(req.params.lemma, req.params.language);
        })
        .then((lemma) => {
          return app.Util.express.respond(res, app.Util.HTTP_STATUS_CODE.OK, lemma.toObject());
        })
        .catch((err) => {
          return app.Util.express.respond(res, app.Util.HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, err);
        })
    }
  })
};