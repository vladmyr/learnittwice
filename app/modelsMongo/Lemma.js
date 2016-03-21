"use strict";

const _ = require("underscore");

module.exports = (define, SchemaTypes, app) => {
  return define("lemma", {
    importId: {
      type: Number,
      required: true
    },
    lemma: {
      type: String,
      required: true
    },
    // denormalized embedded lemma information
    info: [{
      language: {
        type: String,
        required: true
      }, // ToDo - primary key
      order: Number,
      // denormalized embedded sense information
      sense: [{
        importId: Number,
        synsetId: {
          type: SchemaTypes.ObjectId,
          ref: "synset"
        },
        baseLemmaId: {
          type: SchemaTypes.ObjectId,
          required: true
        },
        wordform: Object,
        tagCount: Number,
        order: Number
      }]
    }]
  }, {
    index: [{
      fields: {
        lemma: 1,
        "info.language": 1
      },
      options: {
        unique: true
      }
    }, {
      fields: {
        "info.sense.synsetId": 1
      }
    }, {
      fields: {
        "info.sense.baseLemmaId": 1
      }
    }, {
      "info.order": -1
    }],
    staticMethods: {
      findAll(options) {
        let self = this;

        options = options || {};
        options = _.extend({}, {
          offset: app.Util.Typecast.Number(options.offset) || 0,
          limit: app.Util.Typecast.Number(options.limit) || 20
        });

        return self
          .find()
          .skip(options.offset)
          .limit(options.limit);
      },
      /**
       * Find all lemmas by language
       * @param {String}  language
       * @param {Object}  [sort]
       * @returns {Promise.<Query>}
       */
      findByLanguage(language, sort) {
        let self = this;
        let query = {
          language: language
        };
        let projection = {
          info: {
            $elemMatch: {
              language: language
            }
          }
        };

        return self
          .find(query, projection)
          .sort({ lemma: 1 })
      },
      /**
       * Find lemma by its string
       * @param   {String} lemma
       * @param   {String} [language]
       * @returns {Promise.<Query>}
       */
      findByLemma(lemma, language) {
        let self = this;
        let query = {
          lemma: lemma
        };
        let projection = {};

        if (!_.isEmpty(language)){
          projection = {
            info: {
              $elemMatch: {
                language: language
              }
            }
          }
        }

        return self
          .findOne(query, projection)
          .deepPopulate("info.sense.synsetId")
      },
      /**
       * Find lemma synonyms by its string and language
       * @param   {String} lemma
       * @param   {String} language
       * @returns {Promise.<Query>}
       */
      findSynonyms(lemma, language) {
        let self = this;

        return self
          // find lemma that matches string and language
          .findOne({
            lemma: lemma
          }, {
            info: {
              $elemMatch: {
                language: language
              }
            }
          })
          .then((instance) => {
            // find synonyms by an array of synsets' ids
            let synsetIds = _.map(instance.info[0].sense, sense => sense.synsetId);
            let query = {
              _id: {
                $ne: instance._id
              },
              "info.language": language,
              "info.sense.synsetId": {
                $in: synsetIds
              }
            };

            return self.find(query);
          })
      }
    },
    instanceMethods: {

    }
  })
};