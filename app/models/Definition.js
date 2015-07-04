"use strict";

module.exports = function(sequelize, DataTypes){
  var Definition = sequelize.define("Definition", {
    definitionid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    langid: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false
    },
    definition: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: "definitions",
    timestamp: false,
    classMethods: {
      associate: function(models){
        Definition.belongsTo(models.Synset, { foreignKey: "synsetid" });
      }
    }
  });
  return Definition;
}