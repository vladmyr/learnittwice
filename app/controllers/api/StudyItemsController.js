'use strict';

const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

const Promise = require('bluebird');
const _ = require('underscore');

const Util = alias.require('@file.helpers.util');

module.exports = (router, app) => {
  Util.Express.defineController({
    setup() {
      let self = this;

      router.path = 'study_items';
      router
        .get('/:id', self.getOne, Util.Express.respondHandler)
        .put('/', self.createOne, Util.Express.respondHandler)
        .post('/', self.updateOne, Util.Express.respondHandler)
        .delete('/', self.deleteOne, Util.Express.respondHandler)
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

    updateOne(req, res, next) {
      return next();
    },

    deleteOne(req, res, next) {
      return next();
    }
  })
};