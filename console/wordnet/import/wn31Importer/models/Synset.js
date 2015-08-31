"use strict";

module.exports = function(define, DataTypes, app){
  define("Synset", {
    synsetid: {
      type: DataTypes.INTEGER(10),
      primaryKey: true,
      allowNull: false
    },
    pos: {
      type: DataTypes.ENUM(
        "n",
        "v",
        "a",
        "r",
        "s"
      )
    },
    lexdomainid: {
      type: DataTypes.INTEGER(5),
      allowNull: false
    },
    definition: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: "synsets",
    timestamps: false,
    instanceMethods: {

    },
    classMethods: {

    }
  });
};