"use strict";

/**
 * Script that imports wordforms of Polish language into MongoDB database
 * @module
 */

const Promise  = require("bluebird");
const _ = require("underscore");
const path = require("path");

/**
 * Wordforms importer class
 */
class ImporterMongo {
  constructor(app, options) {
    let self = this;

    options = _.extend({
      source: path.join(__dirname, "source", "pl_PL.UTF-8.txt"),
      split: /\s\>\s/
    }, options);

    self.app = app;
    self.options = options;
  }
  import() {
    let self = this;
    let baseLemma;

    return self.app.Util.fs.readFileByLine(self.options.source, {}, (line) => {
      let tmp = line.split(self.options.split);

      // 1. get or create base lemma
      return Promise.resolve().then(() => {
        if (!_.isEmpty(baseLemma) && baseLemma.lemma === tmp[1]) {
          // base lemma is still valid
          return baseLemma;
        } else {
          // not initialized or lemmas do not match
          return self.app.modelsMongo.Lemma.findOne({
            lemma: tmp[1]
          })
        }
      }).then((baseLemma) => {
        if (_.isEmpty(baseLemma)) {
          // if there is no such lemma - create one
          let _id = new self.app.mongoose.Types.ObjectId();
          baseLemma = new self.app.modelsMongo.Lemma({
            _id: _id,
            importId: -1,
            lemma: tmp[1],
            info: [{
              language: self.app.LANGUAGE.POLISH,
              order: 0,
              sense: [{
                importId: -1,
                baseLemmaId: _id
              }]
            }]
          });

          //return baseLemma.save();
          return baseLemma;
        } else {
          // lemma exists
          !_.isArray(baseLemma.info) && (baseLemma.info = []);

          // create/update its info
          let polishInfo = _.find(baseLemma.info, (item) => {
            return item.language === self.app.LANGUAGE.POLISH
          });

          if (_.isEmpty(polishInfo)) {
            // polish info does not exist - create one
            polishInfo = {
              language: self.app.LANGUAGE.POLISH,
              order: 0,
              sense: []
            };
            baseLemma.info.push(polishInfo);
          }

          // create/update info's sense
          !_.isArray(polishInfo.sense) && (polishInfo.sense = []);
          let sense = _.find(polishInfo.sense, (item) => {
            return item.baseLemmaId.equals(baseLemma._id);
          });

          if (_.isEmpty(sense)) {
            // sense does not exist - create one
            sense = {
              importId: -1,
              baseLemmaId: baseLemma._id,
              tagCount: 0,
              order: 0
            };
            polishInfo.push(sense);
          }

          return baseLemma;
        }
      }).then((baseLemma) => {
        // 2. create or update base lemma's form

      });
    });
  }
}

module.exports = (app, args, callback) => {
  let importer = new ImporterMongo(app, {});

  return importer
    .import()
    .then(() => {
      return callback();
    })
    .catch((err) => {
      return callback(err);
    })
};