"use strict";

module.exports = function(sequelize, DataTypes){
  var Synset = sequelize.define("Synset", {
    synsetid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      allowNull: false
    },
    pos: {
      type: DataTypes.ENUM("n", "v", "a", "r", "s", "nm", "pn"),
      allowNull: false
    },
    lexdomainid: {
      type: DataTypes.INTEGER(5).UNSIGNED
    }
  }, {
    tableName: "synsets",
    timestamp: false,
    classMethods: {
      associate: function(models){
        Synset.hasMany(models.Sense)
        Synset.hasMany(models.Definition)
      }
    }
  });
  return Synset;
}