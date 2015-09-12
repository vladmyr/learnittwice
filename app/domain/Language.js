"use strict";

var LANGUAGES = (function(){
  return {
    UKRAINIAN:  (function() { return "uk"; })(),
    POLISH:     (function() { return "pl"; })(),
    ENGLISH:    (function() { return "gb"; })()
  }
})();

module.exports = LANGUAGES;