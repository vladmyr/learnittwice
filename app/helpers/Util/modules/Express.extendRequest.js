'use strict';

const config = require('config');
const _ = require('underscore');

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
  return (code, message) => {
    if (arguments.length == 1) {
      if (typeof arguments[0] == 'string') {
        message = code;
        code = null;
      }
    }

    return req.setAttr(ATTR.RESPONSE_ERROR, {
      code: code,
      message: message
    })
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