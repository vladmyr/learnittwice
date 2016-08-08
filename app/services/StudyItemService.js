'use strict';

const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

const _ = require('underscore');
const Promise = require('bluebird');

const ResponseError = alias.require('@file.domain.errors.responseError');
const Util = alias.require('@file.helpers.util');

class StudyItemService {
  constructor(app) {
    this.app = app;
  }

  /**
   * List StudyItem instances
   * @param   {String|Mongoose.Types.ObjectId}  [studyInboxId]
   * @param   {Number}                          [offset]
   * @param   {Number}                          [limit]
   * @returns {Promise.<T>}
   */
  list(studyInboxId, offset = 0, limit = 20) {
    let matchCriteria = {};
    let pipeline;

    if (studyInboxId) {
      matchCriteria = {
        _id: studyInboxId
      }
    }

    pipeline = [{
      $match: matchCriteria
    }, {
      $unwind: '$items'
    }];

    return Promise.fromCallback((callback) => {
      return this.app.models.StudyInbox
        .aggregate(pipeline)
        .exec(callback);
    }).then((instances) => {
      return _.map(instances, (instance) => {
        instance.items.id = instance.items._id.toString();
        return instance.items
      });
    })
  }

  /**
   * Find single StudyItem by its id
   * @param   {String|Mongoose.Types.ObjectId} id
   * @returns {Promise.<T>}
   */
  find(id) {
    return this.app.models.StudyInbox.findOne({
      items: {
        $elemMatch: {
          _id: id
        }
      }
    }, {
      _id: 0,
      'items.$': 1
    }).then((instances) => {
      if (!instances || instances.items.length != 1) {
        return Promise.reject(new ResponseError(HTTP_STATUS_CODE.NOT_FOUND, 'document is not found'));
      }

      return instances.items[0];
    })
  }

  /**
   * Create StudyItem record for particular StudyInbox
   * @param   {String|Mongoose.Types.ObjectId}  studyInboxId
   * @param   {Object}                          data
   * @returns {Promise.<T>}
   */
  create(studyInboxId, data) {
    return Promise.resolve().then(() => {
      return this.app.models.StudyInbox.findOne({
        _id: studyInboxId,
        'items.slug': data.slug
      }).count()
    }).then((instance) => {
      if (instance) {
        return Promise.reject(new ResponseError(
          HTTP_STATUS_CODE.BAD_REQUEST,
          'unique slug violation'
        ))
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

  /**
   * Perform update operation on existing StudyItem document
   * @param   {String|Mongoose.Types.ObjectId}  id
   * @param   {Object}                          data
   * @returns {Promise.<T>}
   */
  update(id, data) {
    id = Util.Typecast.objectId(id);

    let orCriteria = [{
      'items._id': id
    }];

    if (typeof data.slug == 'string') {
      orCriteria.push({ 'items.slug': data.slug });
    }

    const pipeline = [{
      // 1. find by id
      $match: { 'items._id': id }
    }, {
      // 2. project only study items
      $project: {
        _id: 0,
        items: 1
      }
    }, {
      // 3. flatten items
      $unwind: '$items'
    }, {
      // 4. filter items
      $match: {
        $or: orCriteria
      }
    }];

    return Promise.fromCallback((callback) => {
      return this.app.models.StudyInbox
        .aggregate(pipeline)
        .exec(callback)
    }).then((instances) => {
      let setValues = {};

      if (instances.length == 0) {
        // no instances found
        return Promise.reject(new ResponseError(
          HTTP_STATUS_CODE.NOT_FOUND,
          'document is not found'
        ))
      } else if (instances.length > 1) {
        // more than one instance found - new slug is not unique
        return Promise.reject(new ResponseError(
          HTTP_STATUS_CODE.BAD_REQUEST,
          'unique slug violation'
        ))
      }

      _.each(data, (value, prop) => setValues[`items.$.${prop}`] = value);

      return this.app.models.StudyInbox.findOneAndUpdate({
        'items._id': id
      }, {
        $set: setValues
      }, {
        new: true,
        fields: {
          _id: 0,
          items: {
            $elemMatch: {
              _id: id
            }
          }
        }
      });
    }).then((instance) => {
      return instance.items[0];
    });
  }

  /**
   * Perform delete operation on existing instance of StudyItem document
   * @param   {String|Mongoose.Types.ObjectId}  id
   * @returns {Promise.<T>}
   */
  delete(id) {
    return Promise.resolve().then(() => {
      return this.app.models.StudyInbox.findOneAndUpdate({
        'items._id': id
      }, {
        $pull: {
          items: {
            _id: id
          }
        }
      })
    })
  }
}

module.exports = StudyItemService;