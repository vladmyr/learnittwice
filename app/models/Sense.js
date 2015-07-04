"use strict";

module.exports = function(sequelize, DataTypes){
  var Sense = sequelize.define("Sense", {
    wordid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true
    },
    synsetid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true
    },
    casedwordid: {
      type: DataTypes.INTEGER(10).UNSIGNED
    },
    senseid: {
      type: DataTypes.INTEGER(10).UNSIGNED
    },
    sensenum: {
      type: DataTypes.INTEGER(5).UNSIGNED
    },
    lexid: {
      type: DataTypes.INTEGER(5).UNSIGNED
    },
    tagcount: {
      type: DataTypes.INTEGER(10).UNSIGNED
    },
    sensekey: {
      type: DataTypes.STRING(100)
    },
    langid: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false
    },
    infinitiveid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    wordformid: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: "senses",
    timestamp: false,
    classMethods: {
      associate: function(models){
        Sense.belongsTo(models.Word, { foreignKey: "wordid" });
        Sense.belongsTo(models.Word, { foreignKey: "infinitiveid", as: "Infinitive" });
        Sense.belongsTo(models.Synset, { foreignKey: "synsetid" });
        Sense.belongsTo(models.WordForm, { foreignKey: "formid" });
        Sense.belongsTo(models.Language, { foreignKey: "langid" });
      }
    }
  });
  return Sense;
}