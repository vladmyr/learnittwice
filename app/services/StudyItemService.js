'use strict';

const Promise = require('bluebird');

class StudyItemService {
  constructor(app) {
    this.app = app;
  }

  create(studyInboxId, data) {
    return Promise.resolve().then(() => {
      return this.app.models.StudyInbox.findOne({
        _id: studyInboxId,
        'items.slug': data.slug
      })
    }).then((instance) => {
      if (instance) {
        // FIXME: send 400 code
        return Promise.reject(new Error('unique StudyItem slug violation'))
      }

      return this.app.models.StudyInbox.findOneAndUpdate({
        _id: studyInboxId
      }, {
        $push: {
          items: data
        }
      }, {
        new: true
      })
    }).then((instance) => {
      const index = instance.items.length - 1;
      return instance.items[index];
    })
  }

  update(id, data) {

  }
}

module.exports = StudyItemService;