"use strict";

module.exports = function(define, DataTypes, app){
  define("Lemma", {
    lemma: {
      type: DataTypes.STRING(80),
      allowNull: false,
      uniq: true
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
    indexes: [{
      name: "lemma",
      fields: ["lemma"]
    }],
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(model, refDb, refModel){

  });
};