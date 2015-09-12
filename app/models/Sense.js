"use strict";

module.exports = function(define, DataTypes, app){
  define("Sense", {
    tagCount: {
      type: DataTypes.INTEGER().UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: "sense",
    timestamps: false,
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(model, refDb, refModel){
    app[refModel].Sense.belongsTo(app[refModel].Lemma, { foreignKey: "lemmaId" });
    app[refModel].Lemma.hasMany(app[refModel].Sense, { foreignKey: "lemmaId" });

    app[refModel].Sense.belongsTo(app[refModel].Synset, { foreignKey: "synsetId" });
    app[refModel].Synset.hasMany(app[refModel].Sense, { foreignKey: "synsetId" });

    app[refModel].Sense.belongsTo(app[refModel].Language, { foreignKey: "languageId" });
    app[refModel].Language.hasMany(app[refModel].Sense, { foreignKey: "languageId" });

    app[refModel].Sense.belongsTo(app[refModel].Wordform, { foreignKey: "wordformId" });
    app[refModel].Wordform.hasMany(app[refModel].Sense, { foreignKey: "wordformId" });
  });
};