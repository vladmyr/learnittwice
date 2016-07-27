'use strict';

const Promise = require('bluebird');

class StudyItemService {
  constructor(app) {
    this.app = app;
  }

  create(studyInboxId, data) {
    return Promise.resolve().then(() => {
      return this.app.models.StudyInbox.findOneAndUpdate({
        _id: studyInboxId
      }, {
        $push: data
      })
    })
  }
}

module.exports = StudyItemService;