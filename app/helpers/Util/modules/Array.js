'use strict';

/**
 * Util functions for arrays
 * @module
 */
class Array {
  /**
   * Slice array into array of chunks
   * @param   {Array}   arr
   * @param   {Number}  chunkSize
   * @returns {Array}
   */
  static chunk(arr, chunkSize) {
    let chunks = [];

    for(let chunkIndex = 0, totalChunks = Math.ceil(arr.length / chunkSize); chunkIndex < totalChunks; chunkIndex++){
      chunks.push(arr.slice(chunkIndex * chunkSize, chunkIndex * chunkSize + chunkSize));
    }

    return chunks;
  }
}

module.exports = Array;