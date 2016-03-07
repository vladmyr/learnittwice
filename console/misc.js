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

  // get word synonyms
  return Promise.resolve().then(() => {
    return app.modelsMongo.Lemma.findOne({
      lemma: "car"
    })
  }).then((lemma) => {
    let obj = lemma.toObject();
    let synsetIds = _.map(obj.info[0].sense, (sense) => {
      return sense.synsetId;
    });
    return app.modelsMongo.Lemma.find({
      
    });
  }).nodeify(callback);
};