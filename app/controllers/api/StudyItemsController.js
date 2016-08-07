'use strict';

const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

const Promise = require('bluebird');
const _ = require('underscore');

const Util = alias.require('@file.helpers.util');
const ResponseError = alias.require('@file.domain.errors.responseError');

module.exports = (router, app) => {
  Util.Express.defineController({
    setup() {
      let self = this;

      router.path = 'study_items';
      router
        .get('/:id', self.getOne, Util.Express.respondHandler)
        .put('/', self.createOne, Util.Express.respondHandler)
        .post('/', self.updateOne, Util.Express.respondHandler)
        .delete('/', self.deleteOne, Util.Express.respondHandler);

      router.param('id', self.paramId);
    },

    paramId(req, res, next, id) {
      if(app.mongoose.Types.OjbectId.isValid(id)) {
        return next();
      } else {
        req.setResponseError(new ResponseError(HTTP_STATUS_CODE.BAD_REQUEST), 'id is not valid');
        return next();
      }
    },

    getOne(req, res, next) {
      return next();
    },

    createOne(req, res, next) {
      const studyInboxId = req.body.studyInboxId;
      const data = _.pick(req.body, 'slug', 'questionType');

      return Promise.resolve().then(() => {
        return app.services.StudyItemService.create(studyInboxId, data);
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
        return app.services.StudyItemService.update(id, data);
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
        return app.services.StudyItemService.delete(id);
      }).then(() => {

      }).catch((e) => {
        req.setResponseError(e);
        return next();
      })
    }
  })
};