"use strict";

var Promise = require("bluebird");
var _ = require("underscore");
var path = require("path");

var wn31Importer = function(app, options){
  var promise = Promise.resolve();
  var options = _.extend({
    database: {
      name: "wordnet"
    },
    modelDir: path.join(__dirname, "models"),
    refDb: "dbWn",
    refModel: "modelsWn"
  }, options);

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
      }).then(function(words){
        //var promise = Promise.resolve();
        //
        //
        //var bulkCreate = [];

        return promise.reduce(words, function(total, word){
          var bulkSynset = [];
          var bulkSense = [];

          var lemma = app[refModel].Lemma.build({
            lemma: word.lemma,
            legacy: true,
            count: 0
          });

          _.each(word.Senses, function(sense){
            
          })
        }, 0);
        //_.each(words, function(word){
        //  _.each(word.sense, function(sense){
        //    bulkSynset
        //  })
        //});
        //
        //_.each(words, function(word){
        //  bulkCreate.push(app[refModel].Lemma
        //    .build(_.extend(_.pick(word, "lemma"), {
        //      legacy: true,
        //      count: 0
        //    })
        //  ));
        //});

        //return app[refModel].Lemma.bulkCreate(bulkCreate,{
        //  transaction: t
        //})
      }).then(function(){
        return t.commit();
      }).catch(function(err){
        return t.rollback();
      })
    });
  };

  var dbInstance = new require(path.join(app.root_dir,
    app.config.dir.domain,
    app.config.filePath.domain.database))(app, {
    name: options.database.name,
    username: app.config.database.username,
    password: app.config.database.username,
    settings: app.config.database.settings
  }, options.modelDir, options.refDb, options.refModel);

  return promise.then(function() {
    console.log("Initializing database connection....");
    return dbInstance.initialize().then(function () {
      return console.log("Done!");
    });
  }).then(function(){
    return app[options.refModel].Word.findById(1)
  }).then(function(word){
    return word;
  }).then(function(){
    return processWords(
      options.refDb,
      options.refModel,
      "db",
      "models");
  });
  //  .catch(function(err){
  //  return Promise.reject(err);
  //});
};

module.exports = function(app, args, callback){
  console.log("Running wn31Importer...");
  return wn31Importer(app)
    .then(function(){
      return console.log("All tasks are done!")
    })
    .then(function(){
      return callback();
    });
    //.catch(function(err){
    //  return callback(err);
    //});
};