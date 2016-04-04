"use strict";

const Promise = require("bluebird");
const fs = require("fs");
const path = require("path");
const _ = require("underscore");

/**
 * Used just for testing different stuff
 * @param app
 * @param args
 * @param callback
 * @returns {*}
 */
module.exports = (app, args, callback) => {
  // (+) get word definition
  //return Promise.resolve().then(() => {
  //  return app.modelsMongo.Lemma.findOne({
  //    lemma: "car"
  //  }).deepPopulate("info.sense.synsetId")
  //}).then((lemma) => {
  //  let obj = lemma.toObject();
  //  return callback();
  //}).catch((err) => {
  //  return callback(err);
  //});

  // (+) get word synonyms and translations
  //return Promise.resolve().then(() => {
  //  return app.modelsMongo.Lemma.findOne({
  //    lemma: "car",
  //    "info.language": app.LANGUAGE.ENGLISH
  //  })
  //}).then((lemma) => {
  //  let obj = lemma.toObject();
  //  let synsetIds = _.map(obj.info[0].sense, sense => sense.synsetId);
  //  return app.modelsMongo.Lemma.find({
  //    "info.sense.synsetId": {
  //      $in: synsetIds
  //    }
  //  });
  //}).then((synonyms) => {
  //  return synonyms;

  //return Promise
  //  .resolve()
  //  .then(() => {
  //    app.Timer.startPoint();
  //    return app.modelsMongo.Lemma.findByLemma("car")
  //  })
  //  .then((lemma) => {
  //    app.Timer.checkpoint();
  //
  //    let obj = lemma.toObject();
  //
  //    console.log(obj.info[0].sense[0].synsetId);
  //    console.log(obj.info[0].sense[0].synset);
  //
  //    return lemma.populateSynonyms();
  //  })
  //  .then((lemma) => {
  //    app.Timer.checkpoint();
  //    app.Timer.print();
  //
  //    let obj = lemma.toObject();
  //    return lemma;
  //  })

  return Promise
    .resolve()
    .then(() => {
      app.Timer.startPoint();
      return app.modelsMongo.Lemma.findAll({
        limit: 1000
      }).populate("info.sense.synsetId")
    })
    .then((docs) => {
      app.Timer.checkpoint();
      app.Timer.print();

      //let obj = docs.toObject();
      return docs;
    })
};