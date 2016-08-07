'use strict';

const _ = require('underscore');
const mongoose = require('mongoose');

/**
 * Type casting utility module
 * @module
 */
class Typecast {
  /**
   * Safely cast argument into number type.
   * Note: if NaN, return 0
   * @param   {Mixed}   n
   * @returns {Number}
   */
  static number(n) {
    let cast = Number(n);

    return _.isNaN(cast)
      ? 0
      : cast
  }

  /**
   * Cast string representation of ObjectId into ObjectId instance
   * Note: throws and error if id is not valid ObjectId
   * @param     {String|Mongoose.Types.ObjectId}    id
   * @returns   {Mongoose.Types.ObjectId}
   */
  static objectId(id) {
    const ObjectId = mongoose.Types.ObjectId;

    if (id instanceof ObjectId) {
      return id;
    } else if (!ObjectId.isValid(id)) {
      throw new Error('typecast error: id is not valid ObjectId')
    } else {
      return new ObjectId(id);
    }
  }
}

module.exports = Typecast;