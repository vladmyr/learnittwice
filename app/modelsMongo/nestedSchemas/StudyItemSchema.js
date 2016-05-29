'use strict';

module.exports = (defineSchema, SchemaTypes) => {
  const studyItemComponentSchema = alias.require('@file.modelsMongo.nestedSchemas.studyItemComponentSchema')(defineSchema, SchemaTypes);
  const studyItem = defineSchema({
    question: {
      type: studyItemComponentSchema,
      required: true
    },
    answer: {
      type: studyItemComponentSchema,
      required: true
    },
    wrongAnswers: [{
      type: studyItemComponentSchema,
      required: true
    }],
    audio: [studyItemComponentSchema],
    images: [studyItemComponentSchema]
  });

  return studyItem;
};