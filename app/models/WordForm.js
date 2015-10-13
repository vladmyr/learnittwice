"use strict";

var _ = require("underscore");
var Promise = require("bluebird");

module.exports = function(define, DataTypes, app){
  define("Wordform", {
    pos: {
      type: DataTypes.ENUM(
        "noun",
        "verb",
        "adjective",
        "adjective_satellite",
        "adverb",
        "pronoun",
        "preposition",
        "conjunction",
        "interjection",
        "clause"
      ),
      allowNull: true,
      defaultValue: null
    },
    gender: {
      type: DataTypes.ENUM(
        "mascunine",
        "feminine",
        "neuter"
      ),
      allowNull: true,
      defaultValue: null
    },
    plurality: {
      type: DataTypes.ENUM(
        "single",
        "plural"
      ),
      allowNull: true,
      defaultValue: null
    },
    case: {
      type: DataTypes.ENUM(
        "nominative",
        "accusative",
        "dative",
        "ablative",
        "genitive",
        "vocative",
        "locative",
        "instrumental"
      ),
      allowNull: true,
      defaultValue: null
    },
    comparison: {
      type: DataTypes.ENUM(
        "positive",
        "comperative",
        "superlative"
      ),
      allowNull: true,
      defaultValue: null
    },
    verbform: {
      type: DataTypes.ENUM(
        "base",
        "gerund",
        "past_simple",
        "past_participle"
      ),
      allowNull: true,
      defaultValue: null
    },
    person: {
      type: DataTypes.ENUM(
        "first",
        "second",
        "third"
      ),
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: "wordform",
    timestamps: false,
    classMethods: {
      findOnly: function(where, options){
        var model = this;
        var attributeNames = Object.keys(model.attributes);
        var _where = {};

        _.each(attributeNames, function(attributeName){
          _where[attributeName] = null;
        });

        _.extend(_where, where);

        return model.findAll({
          where: _where,
          limit: 1,
          offset: 0
        });
      }
      //,
      ///**
      // * Generate an array of any possible combination of model attributes values
      // * @returns {Array}
      // */
      //generateCombinations: function(){
      //  var model = this;
      //  var bulkCreate = [];
      //  var attributeNames = Object.keys(model.attributes);
      //  var processAttribute = function(attributeIndex, instance){
      //    !attributeIndex && (attributeIndex = 0);
      //    !instance && (instance = model.build({}));
      //
      //    var attributeName = attributeNames[attributeIndex];
      //
      //    if(attributeIndex < attributeNames.length){
      //      if(model.attributes[attributeName].values){
      //        var values = model.attributes[attributeName].values.slice(0); //clone array
      //        !_.contains(values, null) && values.push(null);
      //        _.each(values, function(value, index){
      //          var i = instance;
      //
      //          (index > 0) && (i = model.build(_.pick(instance, attributeNames))); //duplicate instance
      //          i.setDataValue(attributeName, value);
      //
      //          processAttribute(++attributeIndex, i);
      //        });
      //      }else{
      //        processAttribute(++attributeIndex, instance);
      //      }
      //    }else{
      //      bulkCreate.push(instance.toJSON());
      //    }
      //  };
      //
      //  processAttribute();
      //  return bulkCreate;
      //}
    },
    instanceMethods: {

    }
  });

  define.after(function(model, refDb, refModel){
    app[refModel].Wordform.belongsToMany(app[refModel].Lemma, { through: app[refModel].Sense, foreignKey: "wordformId" });
    app[refModel].Lemma.belongsToMany(app[refModel].Wordform, { through: app[refModel].Sense, foreignKey: "lemmaId" });
  });
};