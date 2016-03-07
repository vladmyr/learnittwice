"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");

var wn31Importer = function(app, options){
  var promise = Promise.resolve();
  options = _.extend({
    database: {
      name: "wordnet"
    },
    modelDir: path.join(__dirname, "models"),
    refDbWn: "dbWn",
    refModelWn: "modelsWn",
    refDb: "db",
    refModel: "models"
  }, options);

  /**
   * Map part of speech of "wordnet" to "learnittwicev1"
   * @param wnPos
   * @returns {*}
   */
  var mapPartOfSpeech = function(wnPos){
    var map = {
      a: "adjective",
      n: "noun",
      s: "adjective_satellite",
      r: "adverb",
      v: "verb"
    };
    return (map[wnPos] || map["n"]);
  };

  var processWords = function(refDbWn, refModelWn, refDb, refModel, options){
    options = _.extend({
      limit: 1000,
      offset: 0
    }, options);

    return app[refDb].transaction().then(function(t){
      return app[refModelWn].Word.findAll({
        limit: options.limit,
        offset: options.offset,
        include: [{
          model: app[refModelWn].Sense,
          include: [{
            model: app[refModelWn].Synset
          }]
        }]
      }).then(function(words) {
        return Promise.props({
          words: words,
          language: app[refModel].Language.findOne({
            where: {
              iso3166a2: app.LANGUAGE.ENGLISH
            },
            transaction: t
          })
        })
      }).then(function(props0){
        var language = props0.language;

        return Promise.reduce(props0.words, function(total, word){
          return Promise.resolve().then(function(){
            return app[refModel].Lemma.build({
              lemma: word.lemma
            }).save({
              transaction: t
            });
          }).then(function(lemma) {
            return app[refModel].LemmaInfo.build({
              legacy: true,
              count: 0,
              lemmaId: lemma.id,
              languageId: language.id
            }).save({
              transaction: t
            }).then(function(lemmaInfo){
              return Promise.props({
                lemma: lemma,
                lemmaInfo: lemmaInfo
              });
            });
          }).then(function(props){
            return Promise.reduce(word.Senses, function(total, sense){
              return Promise.props(_.extend({
                  language: language,
                  synset: app[refModel].Synset.build({
                    lexdomainid: sense.Synset.lexdomainid,
                    wordnet_id: sense.Synset.synsetid
                  }).save({
                    transaction: t
                  }).then(function(synset){
                    return synset;
                  }),
                  wordform: app[refModel].Wordform.findOne({
                    where: {
                      pos: mapPartOfSpeech(sense.Synset.pos)
                    }
                  }).then(function(wordform){
                    return wordform;
                  })
                }, props)
              ).then(function(props){
                return app[refModel].Definition.build({
                  definition: sense.Synset.definition,
                  languageId: props.language.id,
                  synsetId: props.synset.id
                }).save({
                  transaction: t
                }).then(function(definition){
                  return _.extend(props, {
                    definition: definition
                  });
                })
              }).then(function(props){
                var modelSense = app[refModel].Sense.build({
                  tagCount: sense.tagcount,
                  lemmaId: props.lemma.id,
                  baseLemmaId: props.lemma.id,
                  synsetId: props.synset.id,
                  languageId: props.language.id,
                  wordformId: props.wordform.id
                });

                return modelSense.save({
                  transaction: t
                }).then(function(sense){
                  return _.extend(props, {
                    sense: sense
                  });
                }).catch(function(err){
                  return Promise.reject(err);
                })
              });
            }, 0);
          });
        }, 0);
      }).then(function(){
        return app.Util.db.commit(t);
      }).catch(function(err){
        console.log(err, (err.stack || ""));
        return app.Util.db.rollback(t)
      })
    });
  };

  var Database = require(path.join(app.config.dir.root,
    app.config.file.domain.database));

  var dbInstance = new Database(app, {
    name: options.database.name,
    username: app.config.database.username,
    password: app.config.database.username,
    settings: app.config.database.settings
  }, options.modelDir, options.refDbWn, options.refModelWn);

  return promise.then(function() {
    console.log("Initializing database connection...");
    return dbInstance.initialize().then(function () {
      return console.log("Done!");
    });
  }).then(function(){
    return app[options.refModelWn].Word.count();
  }).then(function(count){
    var processAll = function(props){
      props = _.extend({
        count: 1,
        offset: 0,
        limit: 1000
      }, props);

      return processWords(
        options.refDbWn,
        options.refModelWn,
        options.refDb,
        options.refModel, {
          limit: props.limit,
          offset: props.offset
        }).then(function(){
          console.log("Processed " + props.offset + " - " + (props.offset + props.limit) + " of " + props.count);

          props.offset += props.limit;

          if(props.offset < count){
            return processAll(props);
          }else{
            return Promise.resolve();
          }
        });
    };

    return processAll({ count: count });
  }).catch(function(err){
    return Promise.reject(err);
  });
};

module.exports = function(app, args, callback){
  console.log("Running wn31Importer...");
  return wn31Importer(app)
    .then(function(){
      return console.log("All tasks are done!")
    })
    .then(function(){
      return callback();
    }).catch(function(err){
      return callback(err);
    });
};