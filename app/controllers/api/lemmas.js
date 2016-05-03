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
  app.Util.Express.defineController({
    setup: function(){
      let self = this;

      router
      // - multiple lemmas
        .get("/", self.getMany)
        .get("/lng/:lng", self.parseQuery, self.getMany, self.respond)
        // - single lemma
        .get("/id/:id", self.parseQuery, self.getOneById, self.respond)
        .get("/str/:str", self.parseQuery, self.getOneByStr, self.respond)

      router.path = "lemmas";
      //.get("/:id/translate/:to")

      router.param("id", self.paramId);
      router.param("str", self.paramStr);
    },

    paramId(req, res, next, id) {
      if (app.mongoose.Types.ObjectId.isValid(id)) {
        return next();
      } else {
        return app.Util.Express.respond(res, app.HTTP_STATUS_CODE.BAD_REQUEST, "Invalid parameter")
      }
    },

    paramStr(req, res, next, str) {
      if (_.isEmpty(str)) {
        return app.Util.Express.respond(req, app.HTTP_STATUS_CODE.BAD_REQUEST, "String is empty")
      } else {
        return next();
      }
    },

    parseQuery(req, res, next) {
      req.query = _.pick(req.query, "offset", "limit");
      req.exec = Promise.resolve();
      return next();
    },

    /**
     * Get multiple lemmas
     * TODO: find by language
     */
    getMany(req, res, next) {
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
          return Promise.map(lst, (item) => item.populateSynonyms())
        })
        .then((lst) => {
          return app.Util.Express.respond(
            res,
            app.HTTP_STATUS_CODE.OK,
            app.Util.Mongoose.mapToObject(lst)
          )
        })
    },

    /**
     * Get single lemma
     */
    getOneById(req, res, next) {
      req.exec = Promise
        .resolve(req.exec)
        .then(() => {
          return app.modelsMongo.Lemma
            .findOneById(req.params.lemma, req.params.language)
            .populate(app.modelsMongo.Lemma.POPULATION.SYNSET)
        })
        .then((lemma) => {
          return lemma.populateSynonyms();
        });
    },

    getOneByStr(req, res, next) {
      return Promise
        .resolve()
        .then(() => {
          return app.modelsMongo.Lemma
            .findOneByStr(req.params.lemma, req.params.language)
            .populate(app.modelsMongo.Lemma.POPULATION.SYNSET)
        })
        .then((lemma) => {
          return lemma.populateSynonyms();
        })
    },

    /**
     * Send response message
     */
    respond(req, res, next) {
      return Promise
        .resolve(req.exec)
        .then((data) => {
          if (_.isArray(data)) {
            return app.Util.Mongoose.mapToObject(data)
          } else {
            return data.toObject();
          }
        })
        .then((data) => {
          return app.Util.Express.respond(
            res,
            app.HTTP_STATUS_CODE.OK,
            data);
        })
        .catch((err) => {
          return app.Util.Express.respond(
            res,
            app.HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
            err
          )
        })
    }
  })
};