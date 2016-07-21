"use strict";

const Promise = require("bluebird");
const fs = require("fs");
const path = require("path");
const _ = require("underscore");
const SchemaTypes = require('mongoose').Schema.Types;


class Parent {

  constructor() {
    this[Parent.SCHEMA_DESCRIPTOR] = {};

    this._id = SchemaTypes.ObjectId;
    this.parentAttribute = String;
    this.parentAttribute2 = Number;
  }

  createMongooseSchema() {
    if (!this.constructor[Parent.SCHEMA_DESCRIPTOR]) {
      const props = Object.getOwnPropertyNames(this);
      const attrs = props.filter((prop) => {
        return [Parent.SCHEMA_DESCRIPTOR].indexOf(prop) == -1
      });

      this.constructor[Parent.SCHEMA_DESCRIPTOR] = _.pick(this, attrs);
    }

    return;
  }
}

Parent.SCHEMA_DESCRIPTOR = 'schemaDescriptor';

class Child extends Parent {
  constructor(){
    super();

    this.childAttribute = Object;
    this.childAttribute2 = Boolean;

    this.createMongooseSchema();
  }
}


/**
 * Used just for testing different stuff
 * @param app
 * @param args
 * @param callback
 * @returns {*}
 */
module.exports = (app, args, callback) => {
  let child = new Child();

  return Promise.resolve();

  // (+) get word definition
  //return Promise.resolve().then(() => {
  //  return app.models.Lemma.findOne({
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
  //  return app.models.Lemma.findOne({
  //    lemma: "car",
  //    "info.language": app.LANGUAGE.ENGLISH
  //  })
  //}).then((lemma) => {
  //  let obj = lemma.toObject();
  //  let synsetIds = _.map(obj.info[0].sense, sense => sense.synsetId);
  //  return app.models.Lemma.find({
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
  //    return app.models.Lemma.findByLemma("car")
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

  //return Promise
  //  .resolve()
  //  .then(() => {
  //    app.Timer.startPoint();
  //    return app.models.Lemma.findAll({
  //      limit: 1000
  //    }).populate("info.sense.synsetId")
  //  })
  //  .then((docs) => {
  //    app.Timer.checkpoint();
  //    app.Timer.print();
  //
  //    let obj = docs[0].toObject();
  //    return docs;
  //  })

  //let responsePromise = ResponsePromise();
  //
  //responsePromise.resolve().then(() => {
  //  return true;
  //}).then((v) => {
  //  return false;
  //}).then((v) => {
  //  return true;
  //}).then((v) => {
  //  throw new Error(false);
  //});
};