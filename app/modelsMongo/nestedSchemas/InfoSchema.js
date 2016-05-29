'use strict';

/** Nested into Lemma model infoSchema */
module.exports = (defineSchema, SchemaTypes) => {
  const senseSchema = alias.require('@file.modelsMongo.nestedSchemas.senseSchema')(defineSchema, SchemaTypes);
  const infoSchema = defineSchema({
    language: {
      type: String,
      required: true
    },
    order: Number,
    sense: [senseSchema]  // denormalized embedded sense information
  });

  return infoSchema;
};