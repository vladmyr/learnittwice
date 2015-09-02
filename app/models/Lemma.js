"use strict";

module.exports = function(define, DataTypes, app){
  define("Lemma", {
    lemma: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    legacy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    count: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: "lemma",
    timestamps: false,
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(model, refDb, refModel){

  });
};