"use strict";

module.exports = function(app, args, callback){
  var httpParser = new require("../app/helpers/component/httpParser")(app, args).getInstance();

  httpParser.Glosbe.generateUrlObject({
    from: "en",
    to: "pl",
    word: "bird"
  })
    .then(httpParser.Glosbe.parseUrl)
    .then(httpParser.Glosbe.extractTranslationItem)
    .then(httpParser.Glosbe.downloadAudio)
    .then(callback);

  //httpParser.callP("Glosbe", "parseTranslationItem", {
  //  from: "en",
  //  to: "pl",
  //  word: "bird"
  //}).then(callback);

  //httpParser.Glosbe.generateUrlObject({
  //  from: "en",
  //  to: "pl",
  //  word: "bird"
  //})
  //  .then(httpParser.Glosbe.parseTranslationItem)
  //  .then(httpParser.Glosbe.saveTranslationItemAudio)
  //  .then(callback);
};