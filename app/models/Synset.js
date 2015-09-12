"use strict";

module.exports = function(define, DataTypes, app){
  define("Synset", {
    lexdomainid: {
      type: DataTypes.INTEGER(5),
      allowNull: false
    },
    wordnet_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: "synset",
    timestamps: false,
    classMethods: {

    }
  });

  define.after(function(model, refDb, refModel){

  });
};