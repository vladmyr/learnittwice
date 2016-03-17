"use strict";

module.exports = (define, SchemaTypes) => {
  return define ("synset", {
    importId: Number,
    definition: [{
      language: String,
      text: String,
      examples: [String],
      sourceId: SchemaTypes.ObjectId
    }]
  })
};