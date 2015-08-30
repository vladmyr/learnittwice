"use strict";

module.exports = function(define, DataTypes, app){
  define("Sense", {
    wordid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      allowNull: false,
      uniq: true
    },
    casedwordid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      uniq: true,
      defaultValue: null
    },
    synsetid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      uniq: true,
      allowNull: false,
      primaryKey: true
    },
    senseid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      uniq: true
    },
    sensenum: {
      type: DataTypes.INTEGER(5).UNSIGNED
    },
    lexid: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      allowNull: false
    },
    tagcount: {
      type: DataTypes.INTEGER(10).UNSIGNED
    },
    sensekey: {
      type: DataTypes.STRING(100),
      uniq: true
    }
  }, {
    tableName: "senses",
    timestamps: false,
    classMethods: {

    },
    instanceMethods: {

    }
  })
};