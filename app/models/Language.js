"use strict";

module.exports = function(define, DataTypes, app){
  define("Language", {
    iso3166a2: {
      type: DataTypes.STRING(2), //ToDo: ENUM - ?
      allowNull: false
    }
  }, {
    tableName: "language",
    timestamps: false,
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(model, refDb, refModel){

  });
};