'use strict';

const config = require('config');

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

let extendRequest = (req) => {
  Object.defineProperties(req, {
    [config.namespace]: { value: {}, writable: true, configurable: true, enumerable: true }
  });

  req.getAttr = getAttr(req);
  req.setAttr = setAttr(req);

  return req;
};

module.exports = extendRequest;