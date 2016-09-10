'use strict';

const Promise = require('bluebird');

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
    return Promise.resolve().then(() => {
      return Promise.props({
        studyInbox: this.app.models.StudyInbox
          .find({}, { items: 0 })
          .skip(offset)
          .limit(limit),
        items: this.app.models.StudyInbox
          .aggregate([
            // 1. offset
            { $skip: offset },
            // 2. limit
            { $limit: limit },
            // 3. project only length of items array
            { $project: {
                _id: 0,
                length: {
                  $size: '$items'
                }
              }
            }
          ])
      });
    }).then((props) => {
      props.studyInbox = props.studyInbox || [];
      props.itemsLength = props.itemsLength || [];

      return props.studyInbox.map((studyInbox, index) => {
        studyInbox.itemsLength = props.items[index].length;
        return studyInbox;
      })
    })
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
