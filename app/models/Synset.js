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
    app[refModel].Lemma.belongsToMany(app[refModel].Synset, { through: app[refModel].Sense, foreignKey: "lemmaId" });
    app[refModel].Synset.belongsToMany(app[refModel].Lemma, { through: app[refModel].Sense, foreignKey: "synsetId" });

    app[refModel].Lemma.belongsToMany(app[refModel].Language, { through: app[refModel].Sense, foreignKey: "lemmaId" });
    app[refModel].Language.belongsToMany(app[refModel].Lemma, { through: app[refModel].Sense, foreignKey: "languageId" });
  });
};