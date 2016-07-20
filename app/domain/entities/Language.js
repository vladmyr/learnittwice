'use strict';

const BaseEntity = alias.require('@file.domain.entities.baseEntity');

class LanguageAlphabet extends BaseEntity {
  constructor () {
    super();

    this.letter = String;
    this.count = Number;

    this._createSchemaDescriptor();
  }
}

class Language extends BaseEntity {
  constructor() {
    super();

    this.alphabet = [this._nest(LanguageAlphabet)];

    this._createSchemaDescriptor();
  }
}

module.exports = {
  Language: Language,
  LanguageAlphabet: LanguageAlphabet
};