'use strict';

const Course = (defineModel, defineSchema, SchemaTypes, app) => {
  const lessonSchema = alias.require('@file.modelsMongo.nestedSchemas.lessonSchema')(defineSchema, SchemaTypes);

  return defineModel('course', {
    title: {
      type: String,
      required: true
    },
    order: Number,
    lessons: [lessonSchema]
  })
};

module.exports = Course;