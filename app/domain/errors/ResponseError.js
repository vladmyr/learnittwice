'use strict';

const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

/**
 * Response error object constructor
 * @param       {Number}  httpCode
 * @param       {String}  message
 * @typedef     {Error}   ResponseError
 * @constructor
 */
class ResponseError extends Error {
  constructor(httpCode = HTTP_STATUS_CODE.BAD_REQUEST, message = '') {
    super(message);

    // TODO: change to httpCode
    this.httpCode = httpCode;
  }
}

module.exports = ResponseError;