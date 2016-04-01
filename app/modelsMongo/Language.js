"use strict";

module.exports = (define, defineSchema, SchemaTypes) => {
  return define("language", {
    // iso ISO-639
    _id: String,
    alphabet: [{
      letter: String,
      count: Number // number of lemmas which start with this letter
    }]
  })
};