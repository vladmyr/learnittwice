'use strict';

const Promise = require('bluebird');

class InboxStudyCategoriesService {
  constructor(app) {
    let self = this;

    self.app = app;
  }

  insertOne(data) {
    let self = this;

    return Promise
      .resolve()
      .then(() => {
        return self.app.models.InboxStudy.create(data)
      })
  }
}

module.exports = InboxStudyCategoriesService;
