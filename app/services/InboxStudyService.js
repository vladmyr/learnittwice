'use strict';

class InboxStudyService {
  constructor(app) {
    this.app = app;
  }

  /**
   * List collection stored in InboxStudy collection
   * @param   {Number}  offset
   * @param   {Number}  limit
   * @returns {Query}
   */
  listCollections(offset = 0, limit = 20) {
    return this.app.models.InboxStudy.find().skip(offset).limit(limit);
  }

  /**
   * Find single collection by id in InboxStudy collection
   * @param   {Mongoose.Types.ObjectId} id
   * @returns {Query}
   */
  findCollection(id) {
    return this.app.models.InboxStudy.findById(id);
  }

  /**
   * Perform create operation on InboxStudy collection
   * @param   {Object|Models.InboxStudy} data
   * @returns {Query}
   */
  createCollection(data) {
    return this.app.models.InboxStudy.create(data);
  }

  /**
   * Perform update operation on existing instance of InboxStudy collection
   * @param   {Mongoose.Types.ObjectId} id
   * @param   {Object}                  data
   * @returns {Query}
   */
  updateCollection(id, data) {
    return this.app.models.InboxStudy.findOneAndUpdate({
      _id: id
    }, data)
  }

  /**
   * Perform delete operation on existing instance of InboxStudy collection
   * @param   {Mongoose.Types.ObjectId} id
   * @returns {Query}
   */
  deleteCollection(id) {
    return this.app.models.InboxStudy.findByIdAndRemove(id);
  }
}

module.exports = InboxStudyService;
