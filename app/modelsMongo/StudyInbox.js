'use strict';

const StudyInbox = (defineModel, defineSchema, SchemaTypes, app) => {
  const studyItemSchema = alias.require('@file.modelsMongo.nestedSchemas.studyItemSchema')(defineSchema, SchemaTypes);
  return defineModel('studyInbox', {
    name: {
      type: String,
      required: true
    },
    items: [studyItemSchema]
  }, {
    index: [{
      fields: {
        'items.slug': 1
      }
    }, {
      fields: {
        'items.id': 1
      },
      options: {
        unique: true
      }
    }]
  });
};

module.exports = StudyInbox;