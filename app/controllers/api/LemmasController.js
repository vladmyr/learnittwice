'use strict';

const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

const Promise = require('bluebird');
const _ = require('underscore');

const Util = alias.require('@file.helpers.util');

/**
 * Lemmas controller
 * @param   {express.Router}  router
 * @param   {Application}     app
 * @module
 */
module.exports = function(router, app){
  Util.Express.defineController({
    setup: function(){
      let self = this;

      router
        .get('/', self.getList, Util.Express.respondHandler)
        //.get('/lng/:lng', self.parseQuery, self.getMany, self.respond)
        //.get('/str/:str', self.parseQuery, self.getOneByStr, self.respond)
        .get('/:id', self.parseQuery, self.getOneById, Util.Express.respondHandler);

      router.path = 'lemmas';
      //.get('/:id/translate/:to')

      router.param('id', self.paramId);
      router.param('str', self.paramStr);
    },

    paramId(req, res, next, id) {
      if (app.mongoose.Types.ObjectId.isValid(id)) {
        return next();
      } else {
        return Util.Express.respond(res, HTTP_STATUS_CODE.BAD_REQUEST, 'Invalid parameter')
      }
    },

    paramStr(req, res, next, str) {
      if (_.isEmpty(str)) {
        return Util.Express.respond(req, HTTP_STATUS_CODE.BAD_REQUEST, 'String is empty')
      } else {
        return next();
      }
    },

    parseQuery(req, res, next) {
      req.query = _.pick(req.query, 'offset', 'limit');
      return next();
    },

    /**
     * Get multiple lemmas
     */
    getList(req, res, next) {
      return Promise
        .resolve()
        .then(() => {
          return app.services.LemmaService.list(req.query.offset, req.query.limit)
        })
        .then((lst) => {
          req.setResponseBody(Util.Mongoose.mapToObject(lst));
          return next();
        })
        .catch((e) => {
          req.setResponseError(e);
          return next();
        })
    },

    /**
     * Get single lemma
     */
    getOneById(req, res, next) {
      return Promise
        .resolve()
        .then(() => {
          return app.services.LemmaService.findOneById(req.params.id)
        })
        .then((lemma) => {
          return lemma.populateSynonyms();
        })
        .then((lemma) => {
          req.setResponseBody(Util.Mongoose.mapToObject(lemma));
          return next();
        })
        .catch((e) => {
          req.setResponseError(e);
          return next();
        })
    }
  })
};