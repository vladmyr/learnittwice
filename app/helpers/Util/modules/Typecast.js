'use strict';

const _ = require('underscore');

/**
 * Type casting utility module
 * @module
 */
class Typecast {
  /**
   * Cast argument into number type
   * @param   {Mixed}   n
   * @returns {Number}
   */
  static Number(n) {
    let cast = Number(n);

    return _.isNaN(cast)
      ? 0
      : cast
  }
}

module.exports = Typecast;