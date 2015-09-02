"use strict";

module.exports = function(define, DataTypes, app){
  define("Synset", {
    lexdomainid: {
      type: DataTypes.INTEGER(5),
      allowNull: false
    }
  }, {
    tableName: "synset",
    timestamps: false,
    classMethods: {
      //associate: function(models){
      //  Synset.hasMany(models.Sense)
      //  Synset.hasMany(models.Definition)
      //}
    }
  });

  define.after(function(model, refDb, refModel){

  });
};