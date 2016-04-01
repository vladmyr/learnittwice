"use strict";

const _ = require("underscore");

const Synset = (define, defineSchema, SchemaTypes) => {
  return define ("synset", {
    importId: Number,
    definition: [{
      language: String,
      text: String,
      examples: [String],
      sourceId: SchemaTypes.ObjectId
    }]
  }, {
    virtuals: {
      synonyms: {
        get() {
          let self = this;
          _.isUndefined(self.__synonyms) && (self.__synonyms = []);
          return self.__synonyms;
        },
        set(synonyms) {
          let self = this;
          self.__synonyms = synonyms;
        }
      }
    },
    index: [{
      fields: {
        _id: 1,
        "definition.language": 1
      },
      options: {
        name: "definition.language",
        unique: true
      }
    }]
  })
};

module.exports = Synset;