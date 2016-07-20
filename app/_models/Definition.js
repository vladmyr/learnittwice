"use strict";

module.exports = function(define, DataTypes, app){
  define("Definition", {
    definition: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: "definition",
    timestamps: false,
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(model, refDb, refModel){
    app[refModel].Definition.belongsTo(app[refModel].Language, { foreignKey: "languageId", onDelete: "NO ACTION", onUpdate: "NO ACTION" });
    app[refModel].Language.hasMany(app[refModel].Definition, { foreignKey: "languageId" });

    app[refModel].Definition.belongsTo(app[refModel].Synset, { foreignKey: "synsetId", onDelete: "NO ACTION", onUpdate: "NO ACTION" });
    app[refModel].Synset.hasMany(app[refModel].Definition, { foreignKey: "synsetId" });
  });
};