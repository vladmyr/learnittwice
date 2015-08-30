"use strict";

var LANGUAGES = require("../app/domain/languages");

module.exports = function(app, args, callback){
  var httpParser = new require("../app/helpers/component/httpParser")(app, args).getInstance();

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