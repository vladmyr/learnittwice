"use strict";

module.exports = function(define, DataTypes, app){
  define("Sense", {
    id: {
      type: DataTypes.INTEGER().UNSIGNED,
      primaryKey: true
    },
    wordFormId: {
      type: DataTypes.INTEGER().UNSIGNED,
      defaultValue: 0
    },
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
    app[refModel].Sense.belongsTo(app[refModel].Lemma, { foreignKey: "lemmaId", constraints: false });
    app[refModel].Lemma.hasMany(app[refModel].Sense, { foreignKey: "lemmaId" });

    app[refModel].Sense.belongsTo(app[refModel].Synset, { foreignKey: "synsetId", constraints: false });
    app[refModel].Synset.hasMany(app[refModel].Sense, { foreignKey: "synsetId" });

    app[refModel].Sense.belongsTo(app[refModel].Language, { foreignKey: "languageId", constraints: false });
    app[refModel].Language.hasMany(app[refModel].Sense, { foreignKey: "languageId" });
  });
};