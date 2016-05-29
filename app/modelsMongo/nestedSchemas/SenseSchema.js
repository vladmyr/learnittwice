'use strict';

/** Nested into infoSchema senseSchema */
module.exports = (defineSchema, SchemaTypes) => {
  const senseSchema = defineSchema({
    importId: Number,
    synsetId: {
      type: SchemaTypes.ObjectId,
      ref: "synset",
      asVirtual: "synset"
    },
    baseLemmaId: {
      type: SchemaTypes.ObjectId,
      required: true
    },
    wordform: Object,
    tagCount: Number,
    order: Number
  });

  return senseSchema;
};