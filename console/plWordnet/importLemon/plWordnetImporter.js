"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");
var url = require("url");
var xmlParser = new require("xml2js").Parser();

var PlWordnetImporter = function(app, options){
  var httpParser = new require("../../../app/helpers/component/httpParser")(app).getInstance();

  return new Promise(function(fulfill, reject){
    options = _.extend({
      refDb: "db",
      refModel: "models",
      sourceFile: path.join(__dirname, "source", "wn-pol-lemon.xml")
    }, options);

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
    return Promise.reduce(entries, function(total, entry){
      return Promise.reduce(entry.synsetRef, function(total, synsetRef){
        return httpParser.Wordnet.generateUrlObject(synsetRef)
          .then(httpParser.Wordnet.parseUrl)
          .then(httpParser.Wordnet.extractLemmaInfo)
          .then(function(lemmaInfo){
            return lemmaInfo;
          })
      }, 0);
    }, 0);
  })
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