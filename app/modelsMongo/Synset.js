"use strict";

module.exports = (define, SchemaTypes) => {
  return define ("synset", {
    definition: [{
      languageId: SchemaTypes.ObjectId,
      text: String,
      examples: [String],
      sourceId: SchemaTypes.ObjectId
    }]
  })
};