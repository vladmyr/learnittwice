"use strict";

module.exports = function(sequelize, DataTypes){
  var Word = sequelize.define("Word", {
    wordid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    lemma: {
      type: DataTypes.STRING(80)
    },
    count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: "words",
    timestamp: false,
    classMethods: {
      associate: function(models){
        Word.hasMany(models.Sense);
      }
    }
  });
  return Word;
}