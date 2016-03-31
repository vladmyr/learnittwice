"use strict";

const _ = require("underscore");

const Synset = (define, SchemaTypes) => {
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
    }
  })
};

module.exports = Synset;