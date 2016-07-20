'use strict';

const _ = require('underscore');
const SchemaTypes = require('mongoose').Schema.Types;

/**
 * Base domain entity. Each existing entity must inherit this class
 */
class BaseEntity {
  constructor() {
    this._id = SchemaTypes.ObjectId;
  }

  _createSchemaDescriptor() {
    // set only once - on first instantiation
    if (!this.constructor[BaseEntity.SCHEMA_DESCRIPTOR]) {
      const props = Object.getOwnPropertyNames(this);
      const attrs = props.filter((prop) => {
        return [BaseEntity.SCHEMA_DESCRIPTOR].indexOf(prop) == -1
      });

      this.constructor[BaseEntity.SCHEMA_DESCRIPTOR] = _.pick(this, attrs);
    }

    return;
  }

  getSchemaDescriptor() {
    return this.constructor[BaseEntity.SCHEMA_DESCRIPTOR];
  }

  _nest(ClassRef) {
    const instance = new ClassRef();
    return instance.getSchemaDescriptor();
  }
}

BaseEntity.SCHEMA_DESCRIPTOR = 'schemaDescriptor';

module.exports = BaseEntity;