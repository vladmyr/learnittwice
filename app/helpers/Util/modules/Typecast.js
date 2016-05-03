'use strict';

const _ = require('underscore');

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
}

module.exports = Typecast;