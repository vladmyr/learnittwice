"use strict";

module.exports = function(define, DataTypes, app){
  define("Sense", {
    //Multiple sequelize issues, see postQueries.sql
    tagCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    order: {
      type: DataTypes.INTEGER.UNSIGNED,
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
    app[refModel].Sense.belongsTo(app[refModel].Lemma, { as: "Lemma", foreignKey: "lemmaId", onDelete: "NO ACTION", onUpdate: "NO ACTION" });
    app[refModel].Lemma.hasMany(app[refModel].Sense, { foreignKey: "lemmaId" });

    app[refModel].Sense.belongsTo(app[refModel].Lemma, { as: "BaseLemma", foreignKey: "baseLemmaId", onDelete: "NO ACTION", onUpdate: "NO ACTION" });
    app[refModel].Lemma.hasMany(app[refModel].Sense, { foreignKey: "baseLemmaId" });

    app[refModel].Sense.belongsTo(app[refModel].Synset, { as: "Synset", foreignKey: "synsetId", onDelete: "NO ACTION", onUpdate: "NO ACTION" });
    app[refModel].Synset.hasMany(app[refModel].Sense, { foreignKey: "synsetId" });

    app[refModel].Sense.belongsTo(app[refModel].Language, { as: "Language", foreignKey: "languageId", onDelete: "NO ACTION", onUpdate: "NO ACTION" });
    app[refModel].Language.hasMany(app[refModel].Sense, { foreignKey: "languageId" });

    app[refModel].Sense.belongsTo(app[refModel].Wordform, { as: "Wordform", foreignKey: "wordformId", onDelete: "NO ACTION", onUpdate: "NO ACTION" });
    app[refModel].Wordform.hasMany(app[refModel].Sense, { foreignKey: "wordformId" });
  });
};