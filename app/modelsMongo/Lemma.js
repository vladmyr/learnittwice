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

/**
 * Lemma mongoose model
 * @param   {Function}              define
 * @param   {Mongoose.Schema.Types} SchemaTypes
 * @param   {Application}           app
 * @returns {Mongoose.Model}
 * @module Lemma
 */
const Lemma = (define, SchemaTypes, app) => {
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
    deepPopulateOptions: {
      // TODO - does not work, why?
      //rewrite: {
      //  "info.sense.synsetId": "info.sense.synset"
      //},
      //populate: {
      //  "info.sense.synsetId": {
      //    path: "info.sense.synset"
      //  }
      //}
    },
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
      // static constants
      PROJECTION: PROJECTION,

      findOneByStr() {

      },

      findSynonyms() {

      },

      /**
       * Find all lemma documents
       * @param options
       * @returns {Promise.<Query>}
       */
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
      // findManyByLanguage
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
      // findOneByLemma
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
       * Get grouped by synsetId synonyms of specified lemma
       * @param   {Lemma}   lemma       lemma that is populated with Synsets
       * @param   {String}  [language]
       * @returns {Promise.<Query>}
       * @private
       */
      _findSynonyms(lemma, language) {
        let self = this;
        // reference to selected senses
        let senseRefs = arguments.length == 2
          // language is specified
          ? _.find(lemma.info, (info) => info.language === language).sense
          // language is not specified
          : _.reduce(lemma.info, (result, info) => {
          result.concat(info.sense);
          return result;
        }, []);
        let synsetIds = _.map(senseRefs, (sense) => sense.synsetId._id);
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
          let indexed = _.indexBy(
            _.map(synsets, (synset) => {
              //synset.hexId = synset._id.valueOf();
              return synset;
            }), "_id");

          // loop through each synset and concat with synonyms
          _.each(senseRefs, (sense) => {
            let id = sense.synsetId._id.toString();
            let synonyms = _.isEmpty(indexed[id])
              ? []
              : indexed[id].synonyms;
            sense.synsetId.synonyms = synonyms;
          });

          // TODO - loosing synonyms
          //let obj = lemma.toObject();
          return lemma;
        });
      },

      findTranslation(lemma, from, to) {

      },

      /**
       * Find lemma synonyms by its string and language
       * @param   {String} lemma
       * @param   {String} language
       * @returns {Promise.<Query>}
       */
      // findSynonymsByStr
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

module.exports = Lemma;