"use strict";

module.exports = function(sequelize, DataTypes){
  var Unrecognised = sequelize.define("Unrecognised", {
    unrecognisedid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    lemma: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    langid: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false
    },
    count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: "unrecognised",
    timestamp: false,
    classMethods: {
      associate: function(models){

      }
    }
  });
  return Unrecognised;
}