"use strict";

var Promise = require("bluebird");
var fs = require("fs");
var path = require("path");

/**
 * Used just for testing different stuff
 * @param app
 * @param args
 * @param callback
 * @returns {*}
 */
module.exports = function(app, args, callback){
  return Promise.resolve().then(function(){
    return app.models.Language.find({
      where: {
        iso3166a2: app.LANGUAGE.ENGLISH
      }
    })
  }).then(function(language){
    // get translation - NOT working
    //return app.models.Lemma.findAll({
    //  where: {
    //    lemma: "car"
    //  },
    //  include: [{
    //    model: app.models.LemmaInfo,
    //    where: {
    //      LanguageId: language.id
    //    }
    //  }, {
    //    model: app.models.Synset,
    //    include: [{
    //      model: app.models.Lemma,
    //      include: [{
    //        model: app.models.LemmaInfo,
    //        where: {
    //          LanguageId: language.id
    //        }
    //      }]
    //    }]
    //  }]
    //})

    // get definition
    return app.models.Lemma.findAll({
      where: {
        lemma: "car"
      },
      include: [{
        model: app.models.Sense,
        where: {
          languageId: language.id
        },
        include: [{
          model: app.models.Synset
        }]
      }]
    })
  }).then(function(data){
    return callback();
  }).catch(function(err){
    return callback(err);
  });

  //return app.models.Lemma.findOne({
  //  where: {
  //    id: 1
  //  },
  //  include: [{
  //    model: app.models.Sense
  //  }, {
  //    model: app.models.Language
  //  }, {
  //    model: app.models.Synset,
  //    include: [{
  //      model: app.models.Definition
  //    }]
  //  }],
  //  order: "`Senses`.`tagCount` DESC"
  //}).then(function(lemma){
  //  return callback();
  //}).catch(function(err){
  //  return callback(err);
  //});

  //return new Misc().modelDescribe(app.models.Wordform).then(function(description){
  //  return description;
  //}).then(callback);

  ////Generate wordforms
  //return app.models.Wordform.bulkCreate(
  //  app.models.Wordform.generateCombinations()
  //)
  //  .then(function(affectedRows){
  //    return callback();
  //  });

  //test Wordform.findOnly(where);
  //return app.models.Wordform.findOnly({
  //  pos: "noun",
  //  gender: "mascunine",
  //  plurality: "single"
  //}).then(function(data){
  //  return callback();
  //})
};