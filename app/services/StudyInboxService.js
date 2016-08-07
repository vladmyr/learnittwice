'use strict';

class StudyInboxService {
  constructor(app) {
    this.app = app;
  }

  /**
   * List collection stored in StudyInbox collection
   * @param   {Number}  offset
   * @param   {Number}  limit
   * @returns {Query}
   */
  listCollections(offset = 0, limit = 20) {
    return this.app.models.StudyInbox
      .find({}, { items: 0 })
      .skip(offset)
      .limit(limit);
  }

  /**
   * Find single collection by id in StudyInbox collection
   * @param   {Mongoose.Types.ObjectId} id
   * @returns {Query}
   */
  findCollection(id) {
    return this.app.models.StudyInbox.findById(id);
  }

  /**
   * Perform create operation on StudyInbox collection
   * @param   {Object|Models.StudyInbox} data
   * @returns {Query}
   */
  createCollection(data) {
    return this.app.models.StudyInbox.create(data);
  }

  /**
   * Perform update operation on existing instance of StudyInbox collection
   * @param   {Mongoose.Types.ObjectId} id
   * @param   {Object}                  data
   * @returns {Query}
   */
  updateCollection(id, data) {
    return this.app.models.StudyInbox.findOneAndUpdate({
      _id: id
    }, data, {
      new: true
    })
  }

  /**
   * Perform delete operation on existing instance of StudyInbox collection
   * @param   {Mongoose.Types.ObjectId} id
   * @returns {Query}
   */
  deleteCollection(id) {
    return this.app.models.StudyInbox.findByIdAndRemove(id);
  }
}

module.exports = StudyInboxService;
