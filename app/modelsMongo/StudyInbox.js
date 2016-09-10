'use strict';

const VIRTUAL_STUDY_ITEMS_LENGTH = '__itemsLength';

const StudyInbox = (defineModel, defineSchema, SchemaTypes, app) => {
  const studyItemSchema = alias.require('@file.modelsMongo.nestedSchemas.studyItemSchema')(defineSchema, SchemaTypes);
  return defineModel('studyInbox', {
    name: {
      type: String,
      required: true
    },
    items: [studyItemSchema]
  }, {
    virtuals: {
      itemsLength: {
        set(length) {
          this[VIRTUAL_STUDY_ITEMS_LENGTH] = length
            || 0;
        },

        get() {
          return this[VIRTUAL_STUDY_ITEMS_LENGTH]
            || (this.items || []).length;
        }
      }
    },
    index: [{
      fields: {
        'items._id': 1,
        'items.slug': 1
      },
      options: {
        partialFilterExpression: {
          'items._id': { $exists: true },
          'items.slug': { $exists: true }
        }
      }
    }]
  });
};

module.exports = StudyInbox;