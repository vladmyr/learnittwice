'use strict';

module.exports = (defineSchema, SchemaTypes) => {
  const studyItemSchema = alias.require('@file.modelsMongo.nestedSchemas.studyItemSchema')(defineSchema, SchemaTypes);
  const Lesson = defineSchema({
    title: {
      type: String,
      required: true
    },
    order: Number,
    studyItem: [studyItemSchema]
  });

  return Lesson;
};