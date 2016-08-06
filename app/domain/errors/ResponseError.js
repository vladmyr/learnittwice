'use strict';

const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

/**
 * Response error object constructor
 * @param       {Number}  code
 * @param       {String}  message
 * @typedef     {Error}   ResponseError
 * @constructor
 */
class ResponseError extends Error {
  constructor(code = HTTP_STATUS_CODE.BAD_REQUEST, message = '') {
    super(message);

    this.code = code;
  }
}

module.exports = ResponseError;