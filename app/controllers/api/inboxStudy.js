'use strict';

const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

const Promise = require('bluebird');
const _ = require('underscore');

const Util = alias.require('@file.helpers.util');

module.exports = (router, app) => {
  Util.Express.defineController({
    setup() {
      let self = this;

      router.path = 'study/inbox';
      router
        .get('/', Util.Express.respondHandler)
    }
  })
};