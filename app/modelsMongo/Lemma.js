"use strict";

const _ = require("underscore");
const Promise = require("bluebird");

// mongoose model projections
const PROJECTION = {
  LEMMA: {
    _id: 1,
    lemma: 1
  }
};

// Lemma model populations
const POPULATION = {
  SYNSET: "info.sense.synsetId"
};

/**
 * Lemma mongoose model
 * @param   {Function}              defineModel
 * @param   {Function}              defineSchema
 * @param   {Mongoose.Schema.Types} SchemaTypes
 * @param   {Application}           app
 * @returns {Mongoose.Model}
 * @module Lemma
 */
const Lemma = (defineModel, defineSchema, SchemaTypes, app) => {
  const infoSchema = alias.require('@file.modelsMongo.nestedSchemas.infoSchema')(defineSchema, SchemaTypes);

  return defineModel("lemma", {
    importId: {
      type: Number,
      required: true
    },
    lemma: {
      type: String,
      required: true
    },
    info: [infoSchema]  // denormalized embedded lemma information
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
      fields: {
        "info.order": -1
      }
    }],
    staticMethods: {
      // static constants
      PROJECTION: PROJECTION,
      POPULATION: POPULATION,

      /**
       * Find all lemma documents
       * @param options
       * @returns {Promise.<Query>}
       */
      findAll(options) {
        let self = this;

        options = options || {};
        options = _.extend({}, {
          offset: app.Util.Typecast.number(options.offset) || 0,
          limit: app.Util.Typecast.number(options.limit) || 20
        });

        return self
          .find()
          .skip(options.offset)
          .limit(options.limit);
      },

      /**
       * Find all lemmas by language
       * @param {String}  language
       * @returns {Promise.<Query>}
       */
      findManyByLanguage(language) {
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
      },

      /**
       * Find lemma by its string
       * @param   {String} lemma
       * @param   {String} [language]
       * @returns {Promise.<Query>}
       */
      findOneByStr(lemma, language) {
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
      },

      /**
       * Find one lemma by its id
       * @param   {ObjectId|String}  id
       * @returns {Promise.<Query>}
       */
      findOneById(id) {
        let self = this;
        let query = {
          _id: id
        };

        return self
          .findOne(query)
      }
    },
    instanceMethods: {
      /**
       * Populate lemma with synonyms
       * @param {String|Array.<String>} [lngs]
       * @returns {Promise}
       */
      populateSynonyms(lngs) {
        let self = this.constructor;
        let lemma = this;
        // reference to selected senses
        let senseRefs = _.filter(
          _.reduce(lemma.info, (result, info) => result.concat(info.sense), []),
          (sense) => !_.isEmpty(sense.synset)
        );
        let synsetIds = _.reduce(senseRefs, (result, sense) => {
          sense = sense.toObject();

          if (typeof sense.synset !== "undefined") {
            result.push(sense.synset._id);
          }

          return result;
        }, []);
        // aggregation pipeline
        let pipeline = [{
          // 1. find lemmas that are in the same synset
          $match: {
            "info.sense.synsetId": {
              "$in": synsetIds
            }
          }
        }, {
          // 2. project only _id, lemma, and its synsetId
          $project: {
            _id: 1,
            lemma: 1,
            "info.sense.synsetId": 1
          }
        }, {
          // 3. flatten info array
          $unwind: "$info"
        }, {
          // 4. flatten sense array
          $unwind: "$info.sense"
        }, {
          // 5. remove redundant synsets
          $match: {
            "info.sense.synsetId": {
              "$in": synsetIds
            }
          }
        }, {
          // 6. group
          $group: {
            _id: "$info.sense.synsetId",
            synonyms: {
              $push: {
                _id: "$_id",
                lemma: "$lemma"
              }
            }
          }
        }];

        return Promise.fromCallback((callback) => {
          // get grouped by synset id synonyms
          return self
            .aggregate(pipeline)
            .exec(callback);
        }).then((synsets) => {
          // concat synonyms with synsets
          // get indexed by hexadecimal string representation of ObjectId
          let indexed = _.indexBy(synsets, "_id");

          // loop through each synset and concat with synonyms
          _.each(senseRefs, (sense) => {
            let id = sense.synset._id;
            let synonyms = _.isEmpty(indexed[id])
              ? []
              : indexed[id].synonyms;
            sense.synset.set("synonyms", synonyms);
          });

          return lemma;
        });
      },

      /**
       * Populate lemma with translations
       * @param {String|Array.<String>} [lngs]
       */
      populateTranslate(lngs) {
        let lemma = this;
        let model = lemma.constructor;


      }
    }
  })
};

module.exports = Lemma;