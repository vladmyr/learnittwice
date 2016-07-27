'use strict';

const StudyInbox = (defineModel, defineSchema, SchemaTypes, app) => {
  const studyItemSchema = alias.require('@file.modelsMongo.nestedSchemas.studyItemSchema')(defineSchema, SchemaTypes);
  return defineModel('studyInbox', {
    name: {
      type: String,
      required: true
    },
    //slug: {
    //  type: String,
    //  required: true,
    //  unique: true
    //},
    items: [studyItemSchema]
  }, {
    //index: [{
    //  fields: {
    //    slug: 1
    //  },
    //  options: {
    //    unique: true
    //  }
    //}]
  });
};

module.exports = StudyInbox;