"use strict";

module.exports = (define, SchemaTypes) => {
  return define("lemma", {
    lemma: String,
    // denormalized embedded lemma information
    info: [{
      languageId: SchemaTypes.ObjectId,
      tagCount: Number,
      order: Number,
      // denormalized embedded sense information
      sense: [{
        synsetId: SchemaTypes.ObjectId,
        wordformId: SchemaTypes.ObjectId,
        baseLemmaId: SchemaTypes.ObjectId,
        order: Number
      }]
    }]
  })
};