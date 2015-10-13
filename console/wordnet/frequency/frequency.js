"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");

var PopulateFrequency = function(app, options){
  options = _.extend({
    refDb: "db",
    refModel: "models",
    sourceFile: path.join(__dirname, "source", "20k.txt")
  }, options);

  return app[options.refDb].transaction().then(function(t){
    var count = 100000;

    return app.helpers.utils.fs.readFileByLine(options.sourceFile, {}, function(word){
      return app[options.refModel].Lemma.findOne({
        where: {
          lemma: word
        },
        transaction: t
      }).then(function(lemma){
        !lemma && (lemma = app[options.refModel].Lemma.build({
          lemma: word,
          legacy: 0
        }));

        lemma.set({
          count: count--
        });

        return lemma.save({
          transaction: t
        })
      })
    }).then(function(){
      return app.helpers.utils.db.commit(t);
    }).catch(function(err){
      return app.helpers.utils.db.rollback(t);
    });
  });
};

module.exports = function(app, args, callback){
  console.log("Running PopulateFrequency...")
  return new PopulateFrequency(app)
    .then(function(){
      console.log("All tasks are done!");
      return callback();
    })
    .catch(function(err){
      return callback(err);
    });
};