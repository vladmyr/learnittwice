'use strict';

module.exports = (defineSchema, SchemaTypes) => {
  const studyItemComponentSchema = alias.require('@file.modelsMongo.nestedSchemas.studyItemComponentSchema')(defineSchema, SchemaTypes);
  const studyItem = defineSchema({
    slug: {
      type: String,
      required: true,
      unique: true
    },
    questionType: {
      type: String,
      required: true
    },
    question: {
      type: studyItemComponentSchema,
      required: true
    },
    answer: {
      type: studyItemComponentSchema,
      required: true
    },
    wrongAnswers: [studyItemComponentSchema],
    hints: {
      text: [studyItemComponentSchema],
      audio: [studyItemComponentSchema],
      images: [studyItemComponentSchema]
    }
  });

  return studyItem;
};