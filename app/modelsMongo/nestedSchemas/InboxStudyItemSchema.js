'use strict';

/** Nested into StudyInbox StudyItemInboxSchema */
module.exports = (defineSchema, SchemaTypes) => {
  const studyItemComponentSchema = alias.require('@file.modelsMongo.nestedSchemas.studyItemComponentSchema')(defineSchema, SchemaTypes);
  const inboxStudyItemSchema = defineSchema({
    question: {
      type: studyItemComponentSchema,
      required: true
    },
    answer: {
      type: studyItemComponentSchema,
      required: true
    },
    audio: [studyItemComponentSchema],
    images: [studyItemComponentSchema]
  });

  return inboxStudyItemSchema;
};