"use strict";

module.exports = function(sequelize, DataTypes){
  var SenseNote = sequelize.define("SenseNote", {
    senseid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true
    },
    langid: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      primaryKey: true
    },
    note: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: "sensenotes",
    timestamp: false,
    classMethods: {
      associate: function(models){

      }
    }
  });
  return SenseNote;
}