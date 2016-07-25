'use strict';

const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

const Promise = require('bluebird');
const _ = require('underscore');

const Util = alias.require('@file.helpers.util');

module.exports = (router, app) => {
  Util.Express.defineController({
    setup() {
      let self = this;

      router.path = 'inbox_studies';
      router
        .get('/', self.getMany, Util.Express.respondHandler)
        .get('/:id', self.getOne, Util.Express.respondHandler)
        .delete('/', self.deleteOne, Util.Express.respondHandler)
        .put('/', self.createOne, Util.Express.respondHandler)
        .post('/', self.updateOne, Util.Express.respondHandler)
    },

    paramId(req, res, next, id) {
      if (app.mongoose.Types.ObjectId.isValid(id)) {
        return next();
      } else {
        req.setResponseCode(HTTP_STATUS_CODE.BAD_REQUEST);
        req.setResponseBody(new Error('Id is no valid'));
        return next();
      }
    },

    getMany(req, res, next) {
      const { offset, limit } = req.body;

      return Promise.resolve().then(() => {
        return app.services.InboxStudyService.listCollections(offset, limit);
      }).then((lstCollections) => {
        req.setResponseBody(Util.Mongoose.toJSON(lstCollections));
        return next()
      }).catch((err) => {
        req.setResponseError(err);
        return next()
      })
    },

    getOne(req, res, next) {
      const { id } = req.params;

      return Promise.resolve().then(() => {
        return app.services.InboxStudyService.findCollection(id)
      }).then((collection) => {
        req.setResponseBody(Util.Mongoose.toJSON(collection));
        return next();
      }).catch((err) => {
        req.setResponseError(err);
        return next();
      })
    },

    createOne(req, res, next) {
      const data = _.pick(req.body, 'name');

      return Promise.resolve().then(() => {
        return app.services.InboxStudyService.createCollection(data);
      }).then((collection) => {
        req.setResponseCode(HTTP_STATUS_CODE.CREATED);
        req.setResponseBody(Util.Mongoose.toJSON(collection));
        return next();
      }).catch((err) => {
        req.setResponseError(err);
        return next();
      })
    },

    updateOne(req, res, next) {
      const id = req.body.id;
      const data = _.pick(req.body, 'name');

      return Promise.resolve().then(() => {
        return app.services.InboxStudyService.updateCollection(id, data)
      }).then((collection) => {
        req.setResponseCode(HTTP_STATUS_CODE.OK);
        req.setResponseBody(Util.Mongoose.toJSON(collection));
        return next();
      }).catch((err) => {
        req.setResponseError(err);
        return next();
      })
    },

    deleteOne(req, res, next) {
      const data = _.pick(req.body, 'id');

      return Promise.resolve().then(() => {
        return app.services.InboxStudyService.deleteCollection(data.id);
      }).then(() => {
        return next();
      }).catch((err) => {
        req.setResponseError(err);
        return next();
      })
    }
  })
};