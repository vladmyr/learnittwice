'use strict';

const _ = require('underscore');
const Promise = require('bluebird');

class InboxStudyService {
  constructor(app) {
    this.app = app;
  }

  /**
   * Perform create operation on InboxStudy collection
   * @param   {Object|Models.InboxStudy} data
   * @returns {Promise.<T>}
   */
  createCollection(data) {
    let self = this;

    return Promise
      .resolve()
      .then(() => {
        return self.app.models.InboxStudy.create(data);
      })
  }

  /**
   * Perform delete operation on InboxStudy collection
   * @param   {String|Mongoose.Types.ObjectId} id
   * @returns {Promise.<T>}
   */
  deleteCollection(id) {
    let self = this;

    if (!self.app.mongoose.Types.ObjectId.isValid(id)) {
      id = new self.app.mongoose.Types.ObjectId(id);
    }

    return Promise
      .resolve()
      .then(() => {
        return self.app.models.InboxStudy.remove({ _id: id });
      })
  }
}

module.exports = InboxStudyService;
