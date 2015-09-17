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
  return app.models.Lemma.findOne({
    where: {
      id: 1
    },
    include: [{
      model: app.models.Sense
    }, {
      model: app.models.Language
    }, {
      model: app.models.Synset,
      include: [{
        model: app.models.Definition
      }]
    }],
    order: "`Senses`.`tagCount` DESC"
  }).then(function(lemma){
    return callback();
  }).catch(function(err){
    return callback(err);
  });
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

var Misc = function(){
  return {
    mkdir: function(){
      var dir = path.join(__dirname, "test");
      return fs.mkdir(dir, function(err){
        console.log(err, arguments);
      });
    },
    createPath: function(){
      var filepath = path.join(__dirname, Number(0).toString(), Number(1).toString(), Number(2).toString(), Number(3).toString());
      console.log(filepath);
      return filepath;
    },
    modelDescribe: function(model){
      return model.describe();
    }
  }
};