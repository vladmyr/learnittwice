'use strict';

const InboxStudy = (defineModel, defineSchema, SchemaTypes, app) => {
  const inboxStudyItemSchema = alias.require('@file.modelsMongo.nestedSchemas.inboxStudyItemSchema')(defineSchema, SchemaTypes);
  return defineModel('inboxStudy', {
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String
    },
    items: [inboxStudyItemSchema]
  });
};

module.exports = InboxStudy;