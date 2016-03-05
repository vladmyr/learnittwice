"use strict";

module.exports = function(define, DataTypes, app){
  define("Lemma", {
    lemma: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: "lemma",
    timestamps: false,
    indexes: [{
      name: "lemma",
      fields: ["lemma"]
    }, {
      name: "id",
      fields: ["id"]
    }],
    classMethods: {
      find: function(options){

      }
    },
    instanceMethods: {

    }
  });

  define.after(function(model, refDb, refModel){
    app[refModel].Sense.belongsTo(app[refModel].Lemma, { as: "Lemma", foreignKey: "lemmaId", onDelete: "NO ACTION", onUpdate: "NO ACTION" });
    app[refModel].Lemma.hasMany(app[refModel].Sense, { foreignKey: "lemmaId" });

    //app[refModel].Lemma.belongsToMany(app[refModel].Lemma, { through: app[refModel].Sense, as: "BaseLemma", foreignKey: "lemmaId" });
    //app[refModel].Lemma.belongsToMany(app[refModel].Lemma, { through: app[refModel].Sense, as: "BaseLemma", foreignKey: "baseLemmaId" });
    //
    //app[refModel].Lemma.belongsToMany(app[refModel].Synset, { through: app[refModel].Sense, foreignKey: "lemmaId" });
    //app[refModel].Synset.belongsToMany(app[refModel].Lemma, { through: app[refModel].Sense, foreignKey: "synsetId" });
    //
    //app[refModel].Lemma.belongsToMany(app[refModel].Language, { through: app[refModel].Sense, foreignKey: "lemmaId" });
    //app[refModel].Language.belongsToMany(app[refModel].Lemma, { through: app[refModel].Sense, foreignKey: "languageId" });
    //
    //app[refModel].Lemma.belongsToMany(app[refModel].Wordform, { through: app[refModel].Sense, foreignKey: "lemmaId" });
    //app[refModel].Wordform.belongsToMany(app[refModel].Lemma, { through: app[refModel].Sense, foreignKey: "wordformId" });
  });
};