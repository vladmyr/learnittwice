"use strict";

module.exports = function(define, DataTypes, app){
  define("WordForm", {
    pos: {
      type: DataTypes.ENUM(
        "noun",
        "verb",
        "adjective",
        "adverb",
        "pronoun",
        "preposition",
        "conjunction",
        "interjection",
        "clause"
      )
    },
    gender: {
      type: DataTypes.ENUM(
        "mascunine",
        "feminine",
        "neuter"
      )
    },
    plurality: {
      type: DataTypes.ENUM(
        "single",
        "plural"
      )
    },
    case: {
      type: DataTypes.ENUM(
        "nominative",
        "accusative",
        "dative",
        "ablative",
        "genitive",
        "vocative",
        "locative"
      )
    },
    comparison: {
      type: DataTypes.ENUM(
        "positive",
        "comperative",
        "superlative"
      )
    },
    verbform: {
      type: DataTypes.ENUM(
        "past_perfect",
        "past_continuous",
        "pp",
        "future",
        "gerund")
    },
    person: {
      type: DataTypes.ENUM(
        "first",
        "second",
        "third"
      )
    }
  }, {
    tableName: "wordform",
    timestamps: false,
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(){

  });
};