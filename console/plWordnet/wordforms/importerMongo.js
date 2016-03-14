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
    self.listeners = {};
  }

  /**
   * Add action listener
   * @param {String}    action
   * @param {Function}  fn
   */
  addListener(action, fn) {
    let self = this;

    _.isEmpty(self.listeners[action]) && (self.listeners[action] = []);
    self.listeners[action].push(fn);
  }

  /**
   * Notify subscribers about the action
   * @param {String}        action
   * @param {Array.<Mixed>} [params]
   */
  notify(action, params) {
    let self = this;
    _.each(self.listeners[action] || [], (fn) => fn.apply(self, params));
  }

  /**
   * Import single lemma
   * @param   {String}  strLemma
   * @param   {Object}  [baseLemma]
   * @returns {Promise}
   */
  importOne(strLemma, baseLemma) {
    let self = this;

    self.notify(ImporterMongo.ACTION.BEFORE_IMPORT_ONE, [strLemma]);

    return self.app.modelsMongo.Lemma.findOne({
      lemma: strLemma
    }).then((lemma) => {
      if (_.isEmpty(lemma)) {
        // if there is no such lemma - create one
        let _id = new self.app.mongoose.Types.ObjectId();
        let baseLemmaId = _.has(baseLemma, "_id")
          ? baseLemma._id
          : _id;

        lemma = new self.app.modelsMongo.Lemma({
          _id: _id,
          importId: -1,
          lemma: strLemma,
          info: [{
            language: self.app.LANGUAGE.POLISH,
            order: 0,
            sense: [{
              importId: -1,
              baseLemmaId: baseLemmaId
            }]
          }]
        });
      } else {
        // lemma exists in database - update it
        let baseLemmaId = _.has(baseLemma, "_id")
          ? baseLemma._id
          : lemma._id;

        // create/update lemma's info
        !_.isArray(lemma.info) && (lemma.info = []);
        let polishInfo = _.find(lemma.info, (item) => {
          return item.language === self.app.LANGUAGE.POLISH
        });

        if (_.isEmpty(polishInfo)) {
          // polish info does not exist - create one
          polishInfo = {
            language: self.app.LANGUAGE.POLISH,
            order: 0,
            sense: []
          };
          lemma.info.push(polishInfo);
        }

        // create/update info's sense
        !_.isArray(polishInfo.sense) && (polishInfo.sense = []);
        let sense = _.find(polishInfo.sense, (item) => {
          return item.baseLemmaId.equals(lemma._id);
        });

        if (_.isEmpty(sense)) {
          // sense does not exist - create one
          sense = {
            importId: -1,
            baseLemmaId: baseLemmaId,
            tagCount: 0,
            order: 0
          };
          polishInfo.sense.push(sense);
        }
      }

      const tmp = lemma.toObject();

      // save/update lemma
      return lemma.save();
    }).then((lemma) => {
      self.notify(ImporterMongo.ACTION.AFTER_IMPORT_ONE, [lemma, baseLemma ? baseLemma : lemma]);
      return lemma;
    })
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
          return undefined;
        }
      }).then((baseLemma) => {
        // create or update existing base lemma
        if (_.isEmpty(baseLemma)) {
          // base lemma does not exist - create one
          return self.importOne(tmp[1]);
        } else {
          // base lemma already exists
          return baseLemma;
        }
      }).then((baseLemma) => {
        // 2. create or update lemma's form
        if (baseLemma.lemma !== tmp[0]) {
          // lemma form does not match base lemma's form - import it
          return self.importOne(tmp[0], baseLemma);
        } else {
          // lemma form is the same as base one - skip it
          return Promise.resolve();
        }
      });
    });
  }
}

ImporterMongo.ACTION = {
  BEFORE_IMPORT_ONE: "BEFORE_IMPORT_ONE",
  AFTER_IMPORT_ONE: "AFTER_IMPORT_ONE"
};

module.exports = (app, args, callback) => {
  let importer = new ImporterMongo(app, {});
  let counter = 1;

  importer.addListener(ImporterMongo.ACTION.BEFORE_IMPORT_ONE, (lemma) => {
    console.log(`${counter}) Importing lemma "${lemma}"`)
  });

  importer.addListener(ImporterMongo.ACTION.AFTER_IMPORT_ONE, (lemma, baseLemma) => {
    console.log(`\tDone. Id assigned is "${lemma.id}",\n\tBase lemma is "${baseLemma.lemma}", id is "${baseLemma.id}"`);
    counter++;
  });

  return importer
    .import()
    .then(() => {
      return callback();
    })
    //.catch((err) => {
    //  return callback(err);
    //})
};