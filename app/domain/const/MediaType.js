"use strict";

var MEDIATYPE = (function(){
  return {
    AUDIO:  (function() { return 0; })(),
    IMAGE:  (function() { return 1; })(),
    VIDEO:  (function() { return 2; })()
  }
})();

module.exports = MEDIATYPE;