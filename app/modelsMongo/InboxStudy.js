'use strict';

const InboxStudy = (defineModel, defineSchema, SchemaTypes, app) => {
  const inboxStudyItemSchema = alias.require('@file.modelsMongo.nestedSchemas.inboxStudyItemSchema')(defineSchema, SchemaTypes);
  return defineModel('inboxStudy', {
    name: {
      type: String,
      required: true
    },
    //slug: {
    //  type: String,
    //  required: true,
    //  unique: true
    //},
    items: [inboxStudyItemSchema]
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

module.exports = InboxStudy;