"use strict";

/**
 * Console script. Map information from wordnet 3.1 database
 * into learnittwice mongodb database
 * @module
 */

const Promise = require("bluebird");
const _ = require("underscore");
const path = require("path");

/**
 * Wordnet importer class
 */
class WordnetImporter {
  constructor(app, options) {
    let self = this;

    // actions
    self.ACTIONS = {
      BEFORE_IMPORT_ONE: "beforeImportOne",
      AFTER_IMPORT_ONE: "afterImportOne"
    };

    self.listeners = {};
    self.app = app;
    self.options = _.extend({
      database: {
        name: "wordnet"
      },
      modelDir: path.join(__dirname, "models"),
      refDbWordnet: "dbWordnet",
      refModelWordnet: "modelsWordnet"
    }, options);

    // options for importing
    self.optionsImport = {
      offset: 0,
      limit: 250
    }
  }

  /**
   * Initialize instance
   * @returns {Promise}
   */
  initialize() {
    let self = this;
    // wordnet database connector
    let DatabaseWordnet = require(path.join(
      self.app.config.dir.root,
      self.app.config.file.domain.database
    ));

    let databaseWordnet = new DatabaseWordnet(self.app, {
      name: self.options.database.name,
      username: self.app.config.database.username,
      password: self.app.config.database.username,
      settings: self.app.config.database.settings
    }, self.options.modelDir, self.options.refDbWordnet, self.options.refModelWordnet);

    return Promise.resolve().then(() => {
      return databaseWordnet.initialize();
    }).then((db) => {
      self.app[self.options.refDbWordnet] = db;
      return self;
    });
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
   * Import single wordnet word (including sense and synset)
   * @param   {Object} word
   * @returns {Promise}
   */
  importOne(word) {
    let self = this;
    let lemmaMap = {
      _id: new self.app.mongoose.Types.ObjectId(),
      importId: word.wordid,
      lemma: word.lemma,
      info: [{
        language: self.app.LANGUAGE.ENGLISH,
        order: 0,
        sense: []
      }]
    };

    // notify subscribers on BEFORE_IMPORT_ONE action
    _.each(self.listeners[self.ACTIONS.BEFORE_IMPORT_ONE] || [], (fn) => {
      return fn(word);
    });

    return Promise.each(word.Senses || [], (sense) => {
      let senseMap = {
        importId: sense.senseid,
        order: 0,
        tagCount: sense.tagcount || 0,
        baseLemmaId: lemmaMap._id,
        wordform: {
          pos: sense.pos
        }
      };

      // find or create synset
      return self.app.modelsMongo.Synset.findOne({
        importId: sense.synsetid
      }).then((synset) => {
        if (_.isEmpty(synset)) {
          // synset does not exist - create one
          synset = new self.app.modelsMongo.Synset({
            _id: new self.app.mongoose.Types.ObjectId(),
            importId: sense.synsetid,
            definition: [{
              language: self.app.LANGUAGE.ENGLISH,
              text: sense.Synset.definition,
              examples: [],
              sourceId: null
            }]
          });
          return synset.save();
        } else {
          return synset;
        }
      }).then((synset) => {
        senseMap.synsetId = synset.id;
        lemmaMap.info[0].sense.push(senseMap);
      });
    }, { concurrency: 1 }).then(() => {
      let lemma = new self.app.modelsMongo.Lemma(lemmaMap);
      return lemma.save();
    }).then((lemma) => {
      // notify subscribers on AFTER_IMPORT_ONE action
      _.each(self.listeners[self.ACTIONS.AFTER_IMPORT_ONE] || [], (fn) => {
        return fn(lemma);
      });

      //return lemma;
    });
  }

  /**
   * Import all words from wordnet
   * @param   {Number}  [offset]
   * @returns {Promise}
   */
  importAll(offset) {
    let self = this;

    offset = offset || 0;

    return Promise.resolve().then(() => {
      // get total amount of words in wordnet
      return self.app[self.options.refModelWordnet].Word.count();
    }).then((total) => {
      let options = [];

      for(let i = offset; i < total; i += self.optionsImport.limit) {
        options.push({
          offset: i
        })
      }

      return options;
    }).then((options) => {
      return Promise.each(options, (item) => {
        return self.import(item);
      });
    });
  }

  /**
   * Customizable import
   * @param   {Object}  options
   * @returns {Promise}
   */
  import(options) {
    let self = this;

    options = _.extend({}, self.optionsImport, options);

    return Promise.resolve().then(() => {
      return self.app[self.options.refModelWordnet].Word.findAll({
        limit: options.limit,
        offset: options.offset,
        include: [{
          model: self.app[self.options.refModelWordnet].Sense,
          include: [{
            model: self.app[self.options.refModelWordnet].Synset
          }]
        }]
      })
    }).then((words) => {
      // process each word
      //return Promise.each(words || [], (word) => {
      //  return self.importOne(word)
      //});

      return Promise.all(_.map(words || [], (word) => {
        return self.importOne(word);
      }));
    });
  }
}

module.exports = (app, args, callback) => {
  console.log("Starting Wordnet 3.1 to MongoDB importer...");

  let counter = 1;
  let importer = new WordnetImporter(app);

  importer.addListener(importer.ACTIONS.AFTER_IMPORT_ONE, (lemma) => {
    console.log(`${counter}) Lemma "${lemma.lemma}", id assigned is "${lemma.id}"`);
    counter++;
  });

  return importer.initialize().then(() => {
    return importer.importAll();
  }).then(() => {
    console.log("All tasks are done!");
    return callback();
  }).catch((err) => {
    console.error(err);
    return callback(err);
  });
};