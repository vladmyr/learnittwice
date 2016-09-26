'use strict';

const Promise = require('bluebird');

class StudyInboxService {
  constructor(app) {
    this.app = app;
  }

  /**
   * Find collections stored in StudyInbox collection
   * that match specified criteria
   * @param   {Object}  [criteria={}]
   * @param   {Number}  [offset=0]
   * @param   {Number}  [limit=20]
   * @param   {Number}  [itemsOffset=0]
   * @param   {Number}  [itemsLimit=20]
   * @returns {Query}
   * @private
   */
  _findCollections(
    criteria = {},
    offset = 0,
    limit = 20,
    itemsOffset = 0,
    itemsLimit = 20
  ) {
    return Promise.props({
      studyInboxes: this.app.models.StudyInbox
        .find(criteria, {
          name: 1,
          items: {
            $slice: [itemsOffset, itemsLimit]
          },
          'items._id': 1,
          'items.slug': 1
        })
        .skip(offset)
        .limit(limit),
      itemsLengths: this.app.models.StudyInbox
        .aggregate([{
          $project: {
            length: {
              $size: '$items'
            }
          }
        }])
    }).then((props) => {
      props.studyInboxes = props.studyInboxes || [];
      props.itemsLengths = props.itemsLengths || [];

      return props.studyInboxes.map((studyInbox, index) => {
        studyInbox.itemsLength = props.itemsLengths[index].length;
        return studyInbox;
      })
    })
  }

  /**
   * List collection stored in StudyInbox collection
   * @param   {Number}  offset
   * @param   {Number}  limit
   * @param   {Number}  itemsOffset
   * @param   {Number}  itemsLimit
   * @returns {Query}
   */
  listCollections(offset = 0, limit = 20, itemsOffset = 0, itemsLimit = 20) {
    return this._findCollections({}, offset, limit, itemsOffset, itemsLimit);
  }

  /**
   * Find single collection by id in StudyInbox collection
   * @param   {Mongoose.Types.ObjectId} id
   * @param   {Number}                  itemsOffset
   * @param   {Number}                  itemsLimit
   * @returns {Query}
   */
  findCollection(id, itemsOffset = 0, itemsLimit = 20) {
    return this._findCollections({ _id: id }, 0, 1, itemsOffset, itemsLimit);
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
