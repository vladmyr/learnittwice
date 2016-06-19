'use strict';

const COMPONENT_TYPE = alias.require('@file.const.studyItemComponentType');

const _ = require('underscore');

module.exports = (defineSchema, SchemaTypes) => {
  const studyItemComponentSchema = defineSchema({
    type: {
      type: String,
      required: true,
      enum: _.values(COMPONENT_TYPE)
    },
    content: {
      type: SchemaTypes.Mixed,
      required: true
    }
  });

  return studyItemComponentSchema;
};