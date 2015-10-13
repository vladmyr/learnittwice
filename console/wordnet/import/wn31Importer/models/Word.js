"use strict";

module.exports = function(define, DataTypes, app){
  define("Word", {
    wordid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true
    },
    lemma: {
      type: DataTypes.STRING(80),
      allowNull: false,
      uniq: true
    }
  }, {
    tableName: "words",
    timestamps: false,
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(refDb, refModel){

  })
};