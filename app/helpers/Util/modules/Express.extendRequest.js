'use strict';

const HTTP_STATUS_CODE = alias.require('@file.const.httpStatusCode');

const config = require('config');
const _ = require('underscore');

const ResponseError = alias.require('@file.domain.errors.responseError');

const ATTR = {
  RESPONSE_CODE: 'responseCode',
  RESPONSE_BODY: 'responseBody',
  RESPONSE_ERROR: 'responseError'
};

let setAttr = (req) => {
  return (key, value) => {
    if (typeof key != 'string') {
      throw new Error('RequestWrapper.setAttr(...): type of argument "key" is not a string');
    }

    req[config.namespace][key] = value;
    return;
  };
};

let getAttr = (req) => {
  return (key) => {
    if (typeof key != 'string') {
      throw new Error('RequestWrapper.getAttr(...): type of argument "key" is not a string');
    }

    return req[config.namespace][key];
  };
};

let setResponseCode = (req) => {
  return (code) => {
    req.setAttr(ATTR.RESPONSE_CODE, code);
    return;
  }
};

let getResponseCode = (req) => {
  return () => {
    return req.getAttr(ATTR.RESPONSE_CODE);
  }
};

let setResponseBody = (req) => {
  return (data) => {
    req.setAttr(ATTR.RESPONSE_BODY, data);
    return;
  }
};

let getResponseBody = (req) => {
  return () => {
    return req.getAttr(ATTR.RESPONSE_BODY)
  }
};

let setResponseError = (req) => {
  return (error) => {
    let httpCode = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
    let message;

    if (error instanceof ResponseError) {
      httpCode = error.httpCode;
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error == 'string') {
      message = error;
    }

    return req.setAttr(ATTR.RESPONSE_ERROR, {
      httpCode: httpCode,
      message: message
    });
  }
};

let getResponseError = (req) => {
  return () => {
    return req.getAttr(ATTR.RESPONSE_ERROR);
  }
};

let hasResponseError = (req) => {
  return () => {
    return req.getAttr(ATTR.RESPONSE_ERROR) != null;
  }
};

let extendRequest = (req) => {
  Object.defineProperties(req, {
    [config.namespace]: { value: {}, writable: true, configurable: true, enumerable: true }
  });

  req.getAttr = getAttr(req);
  req.setAttr = setAttr(req);

  // status code
  req.setResponseCode = setResponseCode(req);
  req.getResponseCode = getResponseCode(req);

  // response body
  req.setResponseBody = setResponseBody(req);
  req.getResponseBody = getResponseBody(req);

  // response error
  req.setResponseError = setResponseError(req);
  req.getResponseError = getResponseError(req);

  req.hasResponseError = hasResponseError(req);

  return req;
};

module.exports = extendRequest;