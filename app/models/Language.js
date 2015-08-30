"use strict";

module.exports = function(define, DataTypes, app){
  define("Language", {
    id: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    iso3166_a2: {
      type: DataTypes.STRING(2),
      allowNull: false
    }
  }, {
    tableName: "language",
    timestamp: false,
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(){

  });
};