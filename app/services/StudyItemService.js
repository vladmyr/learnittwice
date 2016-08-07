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