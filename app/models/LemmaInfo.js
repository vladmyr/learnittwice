"use strict";

module.exports = function(define, DataTypes, app){
  define("LemmaInfo", {
    legacy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    count: {
      type: DataTypes.INTEGER(20).UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: "lemmaInfo",
    timestamp: false,
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(model, refDb, refModel){
    app[refModel].LemmaInfo.belongsTo(app[refModel].Lemma, { foreignKey: "lemmaId" });
    app[refModel].Lemma.hasMany(app[refModel].LemmaInfo, { foreignKey: "lemmaId" });

    app[refModel].LemmaInfo.belongsTo(app[refModel].Language, { foreignKey: "languageId" });
    app[refModel].Language.hasMany(app[refModel].LemmaInfo, { foreignKey: "languageId" });
  });
};