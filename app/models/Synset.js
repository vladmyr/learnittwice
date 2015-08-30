"use strict";

module.exports = function(define, DataTypes, app){
  define("Synset", {

  }, {
    tableName: "synset",
    timestamp: false,
    classMethods: {
      //associate: function(models){
      //  Synset.hasMany(models.Sense)
      //  Synset.hasMany(models.Definition)
      //}
    }
  });

  define.after(function(){

  });
};