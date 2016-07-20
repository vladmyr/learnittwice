'use strict';

const Language = alias.require('@file.domain.entities.language').Language;

module.exports = (define, defineSchema, SchemaTypes) => {
  const language = new Language();
  return define('language', language.getSchemaDescriptor);
};