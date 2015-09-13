"use strict";

var LANGUAGES = require("../app/domain/Language");

module.exports = function(app, args, callback){
  //Parse from Glosbe
  //httpParser.Glosbe.generateUrlObject({
  //  from: "en",
  //  to: "pl",
  //  word: "bird"
  //})
  //  .then(httpParser.Glosbe.parseUrl)
  //  .then(httpParser.Glosbe.extractTranslationItem)
  //  .then(httpParser.Glosbe.downloadAudio)
  //  .then(callback);

  // Test api
  app.helpers.httpParser.Glosbe.api.translate({
    from: "pl",
    to: "en",
    word: "ptak"
  })
    .then(function(obj){
      return callback();
    });

  //Parse from Babla
  //httpParser.Babla.generateUrlObject({
  //  from: LANGUAGES.ENGLISH,
  //  to: LANGUAGES.POLISH,
  //  word: "bird"
  //})
  //  .then(httpParser.Babla.parseUrl)
  //  .then(httpParser.Babla.extractTranslationItem)
  //  .then(httpParser.Babla.downloadAudio)
  //  .then(callback);
};