"use strict";

module.exports = function(define, DataTypes, app){
  define("Word", {
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

    }
  });

  define.after(function(){

  });
};