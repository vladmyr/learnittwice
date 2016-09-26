'use strict';

const QUESTION_TYPE = alias.require('@file.const.studyItemQuestionType');
const _ = require('underscore');

module.exports = (defineSchema, SchemaTypes) => {
  const studyItemComponentSchema = alias.require('@file.modelsMongo.nestedSchemas.studyItemComponentSchema')(defineSchema, SchemaTypes);
  const studyItem = defineSchema({
    slug: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      required: true,
      enum: _.values(QUESTION_TYPE)
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