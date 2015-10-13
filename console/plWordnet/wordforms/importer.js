"use strict";

var Promise  = require("bluebird");
var _ = require("underscore");
var path = require("path");

var Importer = function(app, options) {
  options = _.extend({
    sourceFile: path.join(__dirname, "source", "pl_PL.UTF-8_cutted.txt"),
    lemmasPerTransaction: 1000
  }, options);

  return {
    run: function (callback) {
      var counter = 0;

      return app.db.transaction().then(function (transaction) {
        var t = transaction;
        var baseLemma = app.models.Lemma.build({});

        return app.models.Language.findOne({
          where: {
            iso3166a2: app.const.LANGUAGE.POLISH
          }
        }).then(function(language){
          //create fictive Synset for words with no synset connections
          return app.models.Synset.create({
            lexdomainid: 0,
            wordnet_id: 0
          }, {
            transaction: t
          }).then(function(synset){
            return Promise.props({
              language: language,
              synset: synset
            })
          });
        }).then(function(props){
          return app.models.Wordform.findOne({
            where: {
              pos: {
                $eq: null
              }
            },
            transaction: t
          }).then(function(wordform){
            return _.extend(props, {
              wordform: wordform
            });
          });
        }).then(function (props) {
          return app.helpers.utils.fs.readFileByLine(options.sourceFile, {}, function (line) {
            var innerPromise = Promise.resolve();

            line = _.map(line.split(" > "), function (lemma) {
              return lemma.toLowerCase().trim();
            });

            //save base lemma
            if (baseLemma.lemma !== line[1]) {
              innerPromise = innerPromise.then(function () {
                return app.models.Lemma.findOrCreate({
                  where: {
                    lemma: line[1]
                  },
                  defaults: {
                    lemma: line[1]
                  },
                  transaction: t
                }).then(function (lemma) {
                  return baseLemma = lemma[0];
                });
              }).then(function (instance) {
                if (instance[1]) {
                  //save base lemma info
                  return app.models.LemmaInfo.create({
                    legacy: true,
                    count: 0,
                    languageId: props.language.id,
                    lemmaId: instance[0].id
                  }).save({
                    transaction: t
                  });
                } else {
                  return Promise.resolve();
                }
              });
            }

            //save lemma
            return innerPromise.then(function () {
              return app.models.Lemma.findOrCreate({
                where: {
                  lemma: line[0]
                },
                defaults: {
                  lemma: line[0]
                },
                transaction: t
              }).then(function (instance) {
                if (instance[1]) {
                  return app.models.LemmaInfo.findOrCreate({
                    where: {
                      lemmaId: instance[0].id,
                      languageId: props.language.id
                    },
                    defaults: {
                      lemmaId: instance[0].id,
                      languageId: props.language.id,
                      legacy: true,
                      count: 0
                    },
                    transaction: t
                  }).then(function () {
                    return instance[0]
                  })
                } else {
                  return instance[0]
                }
              }).then(function (lemma) {
                return app.models.Sense.findOrCreate({
                  where: {
                    lemmaId: lemma.id,
                    baseLemmaId: baseLemma.id,
                    languageId: props.language.id,
                    synsetId: props.synset.id,
                    wordformId: props.wordform.id
                  },
                  defaults: {
                    lemmaId: lemma.id,
                    baseLemmaId: baseLemma.id,
                    languageId: props.language.id,
                    synsetId: props.synset.id,
                    wordformId: props.wordform.id,
                    tagCount: 0,
                    order: 0
                  },
                  transaction: t
                });
              }).then(function () {
                //generate new transaction in case the amount of db operations reaches the value of options.lemmasPerTransaction
                if (++counter % options.lemmasPerTransaction === 0) {
                  return app.helpers.utils.db.commit(t).then(function () {
                    return app.db.transaction().then(function (transaction) {
                      return t = transaction;
                    });
                  }).catch(function (err) {
                    return app.helpers.utils.db.rollback(t, err)
                  })
                } else {
                  return Promise.resolve();
                }
              });
            });

          }).then(function () {
            return app.helpers.utils.db.commit(t, true).then(callback);
          }).catch(function (err) {
            console.error(err, (err.stack || ""));
            return app.helpers.utils.db.rollback(t, err).catch(callback);
          })
        });
      });
    }
  };
};

module.exports = function(app, args, callback){
  return new Importer(app).run(callback);
};