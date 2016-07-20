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
        .get('/:slug', self.getOne, Util.Express.respondHandler)
        .post('/', self.post, Util.Express.respondHandler)
    },

    getMany(req, res, next){

    },

    getOne(req, res, next){

    },

    post(req, res, next){
      let data = _.pick(req.body, 'name');

      return app.services.InboxStudyService.insertOne(data);
    }
  })
};