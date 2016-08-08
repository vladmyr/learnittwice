'use strict';

const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

const Promise = require('bluebird');
const _ = require('underscore');

const Util = alias.require('@file.helpers.util');
const ResponseError = alias.require('@file.domain.errors.responseError');

module.exports = (router, app) => {
  const StudyItemService = app.services.StudyItemService;

  Util.Express.defineController({
    setup() {
      let self = this;

      router.path = 'study_items';
      router
        .get('/', self.getMany, Util.Express.respondHandler)
        .get('/:id', self.getOne, Util.Express.respondHandler)
        .put('/', self.createOne, Util.Express.respondHandler)
        .post('/', self.updateOne, Util.Express.respondHandler)
        .delete('/', self.deleteOne, Util.Express.respondHandler);

      router.param('id', self.paramId);
    },

    paramId(req, res, next, id) {
      // FIXME: immediately send error response and skip further computations
      if(!app.mongoose.Types.ObjectId.isValid(id)) {
        req.setResponseError(new ResponseError(HTTP_STATUS_CODE.BAD_REQUEST, 'id is not valid'));
      }

      return next();
    },

    getMany(req, res, next) {
      return Promise.resolve().then(() => {
        return StudyItemService.list()
      }).then((instances) => {
        req.setResponseCode(HTTP_STATUS_CODE.OK);
        req.setResponseBody(Util.Mongoose.toJSON(instances));
        return next();
      }).catch((e) => {
        req.setResponseError(e);
        return next();
      })
    },

    getOne(req, res, next) {
      const id = req.params.id;

      return Promise.resolve().then(() => {
        return StudyItemService.find(id)
      }).then((instance) => {
        req.setResponseCode(HTTP_STATUS_CODE.OK);
        req.setResponseBody(Util.Mongoose.toJSON(instance));
        return next();
      }).catch((e) => {
        req.setResponseError(e);
        return next();
      })
    },

    createOne(req, res, next) {
      const studyInboxId = req.body.studyInboxId;
      const data = _.pick(req.body, 'slug', 'questionType');

      return Promise.resolve().then(() => {
        return StudyItemService.create(studyInboxId, data);
      }).then((instance) => {
        req.setResponseCode(HTTP_STATUS_CODE.CREATED);
        req.setResponseBody(Util.Mongoose.toJSON(instance));
        return next();
      }).catch((e) => {
        req.setResponseError(e);
        return next();
      })
    },

    // TODO: investigate other solutions
    updateOne(req, res, next) {
      const id = req.body.id;
      const data = _.pick(req.body, 'slug', 'questionType', 'question', 'answer');

      return Promise.resolve().then(() => {
        return StudyItemService.update(id, data);
      }).then((instance) => {
        req.setResponseCode(HTTP_STATUS_CODE.OK);
        req.setResponseBody(Util.Mongoose.toJSON(instance));
        return next();
      }).catch((e) => {
        req.setResponseError(e);
        return next();
      })
    },

    deleteOne(req, res, next) {
      const id = req.body.id;

      return Promise.resolve().then(() => {
        return StudyItemService.delete(id);
      }).then(() => {
        req.setResponseCode(HTTP_STATUS_CODE.NO_CONTENT);
        return next();
      }).catch((e) => {
        req.setResponseError(e);
        return next();
      })
    }
  })
};