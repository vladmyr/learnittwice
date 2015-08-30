"use strict";

module.exports = function(define, DataTypes, app){
  define("Sense", {

  }, {
    tableName: "sense",
    timestamps: false,
    classMethods: {
      //associate: function(models){
      //  Sense.belongsTo(models.Word, { foreignKey: "wordid" });
      //  Sense.belongsTo(models.Word, { foreignKey: "infinitiveid", as: "Infinitive" });
      //  Sense.belongsTo(models.Synset, { foreignKey: "synsetid" });
      //  Sense.belongsTo(models.WordForm, { foreignKey: "formid" });
      //  Sense.belongsTo(models.Language, { foreignKey: "langid" });
      //}
    },
    instanceMethods: {

    }
  });

  define.after(function(){

  });
};