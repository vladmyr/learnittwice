"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");
var url = require("url");
var xmlParser = new require("xml2js").Parser();

var PlWordnetImporter = function(app, options){
  var httpParser = app.helpers.httpParser;

  options = _.extend({
    refDb: "db",
    refModel: "models",
    sourceFile: path.join(__dirname, "source", "wn-pol-lemon.xml")
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
              pos: pos
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
    return app[options.refDb].transaction().then(function(t) {
      return Promise.resolve().then(function(){
        return app[options.refModel].Language.find({
          where: {
            iso3166a2: app.const.LANGUAGE.POLISH
          },
          transaction: t
        })
      }).then(function(plLanguage){
        return Promise.reduce(entries, function(total, entry){
          return Promise.reduce(entry.synsetRef, function(total, synsetRef){
            return httpParser.Wordnet.generateUrlObject(synsetRef)
              .then(httpParser.Wordnet.parseUrl)
              .then(httpParser.Wordnet.extractLemmaInfo)
              .then(function(lemmaInfo) {
                if (!lemmaInfo.length || !lemmaInfo[0].lemma) {
                  console.log("Lemma was not parsed.");
                  //search translation in glosbe
                  return httpParser.Glosbe.api.translate({
                    from: app.const.LANGUAGE.POLISH,
                    to: app.const.LANGUAGE.ENGLISH,
                    word: entry
                  }).then(function(obj){

                  });
                  //return Promise.reject(new Error( Nothing to process."));
                }else{
                  return lemmaInfo;
                }
              }).then(function(lemmaInfo){
                return Promise.reduce(lemmaInfo[0].lemma, function(total, lemma){
                  return app[options.refModel].Lemma.find({
                    where: {
                      lemma: lemma
                    },
                    include: [{
                      model: app[options.refModel].Sense,
                      include: [{
                        model: app[options.refModel].Synset
                      }]
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
                        return Promise.reduce(lemma.Senses, function(total, sense){
                          return app[options.refModel].Sense.build({
                            lemmaId: plLemma.id,
                            languageId: plLanguage.id,
                            synsetId: sense.synsetId,
                            wordformId: sense.wordform,
                            tagCount: sense.tagCount
                          }).save({
                            transaction: t
                          })
                        }, 0);
                      });
                    }
                  });
                });
              }).catch(function(err){
                return Promise.reject(err);
              })
          }, 0);
        }, 0).then(function(){
          return app.helpers.utils.db.rollback(t);
        }).then(function(err){
          return app.helpers.utils.db.rollback(t).then(function(){
            return err;
          });
        });
      });
    });
  });
};

module.exports = function(app, args, callback){
  console.log("Executing PlWordnetImporter...");
  return new PlWordnetImporter(app).then(function(){
    console.log("All tasks are done!");
    return callback();
  }).catch(function(err){
    console.log("An error occurred. Aborted!");
    return callback(err);
  })
};