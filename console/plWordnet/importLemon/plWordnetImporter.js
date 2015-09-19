"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");
var url = require("url");
var xmlParser = new require("xml2js").Parser();

var PlWordnetImporter = function(app, options){
  /**
   * Helper function to process polish lemma
   * @param lemma
   * @param language
   * @param entry
   * @param synsetRef
   * @param t
   * @returns {*}
   */
  var processLemma = function(lemma, language, entry, synsetRef, t){
    return app[options.refModel].Lemma.find({
      where: {
        lemma: lemma
      },
      include: [{
        model: app[options.refModel].Synset
      }, {
        model: app[options.refModel].Language,
        where: {
          id: language[app.const.LANGUAGE.ENGLISH].id
        }
      }],
      transaction: t
    }).then(function(lemma){
      if(!lemma){
        console.log("Lemma '" + lemma + "'not found in DB. Lemma is skipped");
        return Promise.resolve();
      }else{
        return app[options.refModel].Lemma.findOrCreate({
          where: {
            lemma: entry.lemma[0]
          },
          defaults: {
            count: 0,
            legacy: true
          },
          transaction: t
        }).then(function(plLemma){
          return Promise.reduce(lemma.Synsets, function(total, synset){
            var modelSense = app[options.refModel].Sense.build({
              tagCount: synset.Sense.tagCount,
              lemmaId: plLemma[0].id,
              synsetId: synset.Sense.synsetId,
              languageId: language[app.const.LANGUAGE.POLISH].id,
              wordformId: synset.Sense.wordformId
            });

            return modelSense.save({
              transaction: t
            }).then(function(){
              synsetRef.isProcessed = true;
            }).catch(app.Sequelize.UniqueConstraintError, function(err){
              //on duplicate ignore workaround fix
              return Promise.resolve();
            })
          }, 0);
        });
      }
    });
  };

  var processChunk = function(entries, language){
    return app[options.refDb].transaction().then(function(t){
      return Promise.reduce(entries, function(total, entry){
        //return Promise.reduce(entry.synsetRef, function(total, synsetRef){
        //  return httpParser.Wordnet.generateUrlObject(synsetRef)
        //    .then(httpParser.Wordnet.parseUrl)
        //    .then(httpParser.Wordnet.extractLemmaInfo)
        //    .then(function(lemmaInfo) {
        //      if (!lemmaInfo.length || !lemmaInfo[0].lemma) {
        //        console.log("Lemma was not parsed. Lemma is skipped");
        //        return Promise.resolve();
        //      }else{
        //        return processLemma(lemmaInfo[0].lemma, language, entry, synsetRef, t);
        //      }
        //    }).catch(function(err){
        //      console.error(err, err.stack);
        //      return Promise.reject(err);
        //    })
        //}, 0).then(function(){
          //if there are not processed entries, than get translation from glosbe and generate senses
          var innerPromise = Promise.resolve();
          var hasUnprocessed = true;

          //_.each(entry.synsetRef, function(synsetRef){
          //  !hasUnprocessed && (hasUnprocessed = !synsetRef.isProcessed);
          //});

          if(hasUnprocessed){
            innerPromise = innerPromise.then(function(){
              return httpParser.Glosbe.api.translate({
                from: app.const.LANGUAGE.POLISH,
                to: app.const.LANGUAGE.ENGLISH,
                word: entry.lemma[0]
              }).then(function(obj){
                if(!obj || !obj.tuc){
                  return Promise.resolve();
                }else{
                  return Promise.reduce(obj.tuc, function(total, item){
                    //if there is a translation and its language is english
                    if(item.phrase
                      && item.phrase.text
                      && item.phrase.language
                      && item.phrase.language === httpParser.Glosbe.getLanguages()[app.const.LANGUAGE.ENGLISH]){
                      return processLemma(item.phrase.text, language, entry, {}, t);
                    }else{
                      //otherwise skip
                      return Promise.resolve();
                    }
                  }, 0).catch(function(err){
                    return Promise.reject(err);
                  });
                }
              });
            });
          }

          return innerPromise;
        //});
      }, 0).then(function(){
        return app.helpers.utils.db.commit(t);
      }).catch(function(err){
        return app.helpers.utils.db.rollback(t).then(function(){
          return err;
        });
      });
    })
  };

  var processAll = function(entries, language, skipUntilLemma){
    typeof skipUntil !== "undefined" && (entries = skipUntil(entries, skipUntilLemma));

    var chunkSize = 100;
    var chunks = app.helpers.utils.arr.chunk(entries, chunkSize);

    return Promise.reduce(chunks, function(total, chunk, index){
      console.log("Processing chunk [" + (index * chunkSize) + " - " + (index * chunkSize + chunk.length) + "]...");
      return processChunk(chunk, language).then(function(){
        return console.log("Done!");
      })
    }, 0);
  };

  /**
   * Skip all entries until specified entry is found
   * @param entries
   * @param entryLemma
   */
  var skipUntil = function(entries, entryLemma){
    var isIncluded = false;

    return _.filter(entries, function(value, index){
      if(value.lemma[0] === entryLemma){
        isIncluded = true;
      }
      return isIncluded;
    });
  };

  var httpParser = app.helpers.httpParser;

  options = _.extend({
    refDb: "db",
    refModel: "models",
    //sourceFile: path.join(__dirname, "source", "wn-pol-lemon-testcases.xml")
    sourceFile: path.join(__dirname, "source", "wn-pol-lemon.xml"),
    skipUntilLemma: false
  }, options);

  return new Promise(function(fulfill, reject){
    console.log("Reading xml file '" + options.sourceFile + "'...");
    return app.helpers.utils.fs.readFile(options.sourceFile).then(function(xmlData){
      console.log("Done!\nParsing xml data...");
      xmlParser.parseString(xmlData, function(err, xmlParsed){
        console.log("Done!\nMapping parsed data...");

        var entries = _.map(xmlParsed["rdf:RDF"]["lemon:Lexicon"][0]["lemon:entry"], function(item){
          var pos = _.last(item["lemon:LexicalEntry"][0]["$"]["rdf:about"].split("-"));
          var lemma = _.map(item["lemon:LexicalEntry"][0]["lemon:canonicalForm"], function(canonicalForm){
            return canonicalForm["lemon:Form"][0]["lemon:writtenRep"][0]["_"];
          });
          var synsetRef = _.map(item["lemon:LexicalEntry"][0]["lemon:sense"], function(sense){
            var urlPath = url.parse(sense["lemon:LexicalSense"][0]["lemon:reference"][0]["$"]["rdf:resource"]).pathname.split("/");
            var ref = {
              wn: urlPath[1],
              synsetId: urlPath[2].split("-")[0],
              pos: pos,
              isProcessed: false
            };

            return ref;
          });

          return {
            pos: pos,
            lemma: lemma,
            synsetRef: synsetRef
          }
        });

        console.log("Done!");

        return err ? reject(err) : fulfill(entries)
      });
    })
  }).then(function(entries){
    return Promise.resolve().then(function(){
      return app[options.refModel].Language.findAll({
        where: {
          iso3166a2: [app.const.LANGUAGE.POLISH, app.const.LANGUAGE.ENGLISH]
        }
      }).then(function(language){
        return _.indexBy(language, "iso3166a2");
      })
    }).then(function(language){
      return processAll(entries, language, options.skipUntilLemma);
    });
  });
};

module.exports = function(app, args, callback){
  console.log("Executing PlWordnetImporter...");
  return new PlWordnetImporter(app, {
    skipUntilLemma: "gofrownica"
  }).then(function(){
    console.log("All tasks are done!");
    return callback();
  }).catch(function(err){
    console.log("An error occurred. Aborted!");
    return callback(err);
  })
};