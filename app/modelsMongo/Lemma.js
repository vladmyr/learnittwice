"use strict";

module.exports = (define, SchemaTypes) => {
  return define("lemma", {
    importId: Number,
    lemma: String,
    // denormalized embedded lemma information
    info: [{
      language: String,
      order: Number,
      // denormalized embedded sense information
      sense: [{
        importId: Number,
        synsetId: SchemaTypes.ObjectId,
        baseLemmaId: SchemaTypes.ObjectId,
        wordform: Object,
        tagCount: Number,
        order: Number
      }]
    }]
  })
};