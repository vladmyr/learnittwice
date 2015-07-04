"use strict";

module.exports = function(sequelize, DataTypes){
  var WordForm = sequelize.define("WordForm", {
    wordformid: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    pos: {
      type: DataTypes.ENUM("n", "v", "a", "r", "s", "nm", "pn")
    },
    gender: {
      type: DataTypes.ENUM("m", "f", "n")
    },
    plurality: {
      type: DataTypes.ENUM("s", "p")
    },
    case: {
      type: DataTypes.ENUM("n", "g", "d", "a", "a", "i", "p")
    },
    comparison: {
      type: DataTypes.ENUM("p", "c", "s") //p - positive, c - comperative, s - superlative
    },
    verbform: {
      type: DataTypes.ENUM("pr", "pa", "pp", "f", "g") //ps - present simple, ps - past simple, pp - past perfect, f - future, g - gerund
    },
    person: {
      type: DataTypes.ENUM("f", "s", "t") //f - first, s - second, t- third
    }
  }, {
    tableName: "wordforms",
    timestamp: false,
    classMethods: {
      associate: function(models){
        WordForm.hasMany(models.Sense)
      }
    }
  });
  return WordForm;
}