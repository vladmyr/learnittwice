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
    self.total = 0;
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
   * @param   {String}          strLemma
   * @param   {Mongoose.model}  [baseLemma]
   * @returns {Promise}
   */
  mapOne(strLemma, baseLemma) {
    let self = this;

    !_.isEmpty(baseLemma) && (baseLemma = baseLemma.toObject());

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
          lemma.info.push({
            language: self.app.LANGUAGE.POLISH,
            order: 0,
            sense: []
          });
          polishInfo = _.last(lemma.info); // copy by reference
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

      const obj = lemma.toObject();

      if(obj.lemma === "aara") {
        console.log(JSON.stringify(obj));
      }

      // save/update lemma
      return lemma;
    })
  }

  importOne(strLemma, baseLemma) {
    let self = this;
    return self
      .mapOne(strLemma, baseLemma)
      .then((lemma) => {
        self.notify(ImporterMongo.ACTION.BEFORE_IMPORT_ONE, [lemma]);
        return lemma.save();
      }).then((lemma) => {
        self.notify(ImporterMongo.ACTION.AFTER_IMPORT_ONE, [lemma, baseLemma ? baseLemma : lemma]);
        return lemma;
      })
  }

  /**
   * Map a group of lemmas
   * @param   {Array.<Object>}  group
   * @returns {Promise}
   */
  mapGroup(group) {
    let self = this;
    let base = group[0].base;

    return Promise.resolve().then(() => {
      return self.mapOne(base);
    }).then((baseLemma) => {
      return Promise.props({
        baseLemma: baseLemma,
        lemmas: _.map(_.filter(_.pluck(group, "lemma"), (lemma) => lemma !== base), (lemma) => {
          return self.mapOne(lemma, baseLemma);
        })
      })
    }).then((props) => {
      return Promise.all([props.baseLemma].concat(props.lemmas));
    });
  }

  /**
   * Map and save a group of lemmas to MongoDB
   * @param   {Array.<Object>}  group
   * @returns {Promise}
   */
  importGroup(group) {
    let self = this;

    // execute in parallel
    return Promise
      .resolve(self.mapGroup(group))
      .then((map) => {
        return Promise.each(map, (item) => {
          return Promise
            .resolve(item)
            .then((lemma) => {
              return lemma.save();
            })
            .then((lemma) => {
              self.notify(ImporterMongo.ACTION.AFTER_IMPORT_ONE, [lemma, map[0] ? map[0] : lemma, self.total]);
            });
        });
      });
  }

  /**
   * Modified variation of import method
   * @param   {Number}  [concurrency = 1]   amount of lemma groups to process in parallel
   * @param   {String}  [skipUntil]         lemma to skip
   * @returns {Promise}
   */
  import4(concurrency, skipUntil) {
    !concurrency && (concurrency = 1);

    let self = this;
    let chunk = [];
    let group = [];
    let i = concurrency;
    let isSkipped = !!skipUntil;

    // read by line and save to database sequentially
    return self.app.Util.Fs.readFileByLine(self.options.source, (line) => {
      let tmp = line.split(self.options.split);

      if (isSkipped) {
        // skip till offset
        isSkipped = tmp[0] != skipUntil;
      } else {
        if (!_.has(_.last(group), "base")) {
          // there is no base lemma yet - create one
          group = [{
            base: tmp[1],
            lemma: tmp[0]
          }];
        } else if (_.last(group).base === tmp[1]) {
          // base lemma is the same - populate group
          group.push({
            base: tmp[1],
            lemma: tmp[0]
          })
        } else {
          // base lemma is different - create new group
          chunk.push(group);

          group = [{
            base: tmp[1],
            lemma: tmp[0]
          }];

          --i;
        }

        if (i == 0) {
          // chunk size is exceeded - save to database
          return Promise
            .all(_.map(chunk, group => self.importGroup(group)))
            .then(() => {
              chunk = [];
              i = concurrency;
            });
        }
      }
    });
  }

  /**
   * Only for test purpose. Map specific group of lemmas
   * @param   {String}  base
   * @returns {Promise}
   */
  testMapGroup(base) {
    let self = this;
    let chunk = [];
    let group = [];

    // read by line and save to database sequentially
    return self.app.Util.Fs.readFileByLine(self.options.source, (line) => {
      let tmp = line.split(self.options.split);

      if (tmp[1] === base) {
        if (!_.has(_.last(group), "base")) {
          // there is no base lemma yet - create one
          group = [{
            base: tmp[1],
            lemma: tmp[0]
          }];
        } else if (_.last(group).base === tmp[1]) {
          // base lemma is the same - populate group
          group.push({
            base: tmp[1],
            lemma: tmp[0]
          })
        } else {
          // base lemma is different - create new group
          chunk.push(group);

          group = [{
            base: tmp[1],
            lemma: tmp[0]
          }];
        }
      }
    }).then(() => {
      return self.mapGroup(group)
    }).then((map) => {
      let obj = _.map(map, item => item.toObject());
      return map;
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
    console.log(`Importing lemma "${lemma.lemma}"`);
  });

  importer.addListener(ImporterMongo.ACTION.AFTER_IMPORT_ONE, (lemma, baseLemma) => {
    console.log(`${(counter + 1)}) Lemma "${lemma.lemma}", id assigned is "${lemma.id}",\n\tBase lemma is "${baseLemma.lemma}", id is "${baseLemma.id}"`);
    counter++;
  });

  return importer.import4(1);
  //return importer.testMapGroup("aara");
};