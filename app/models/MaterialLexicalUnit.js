"use strict";

module.exports = function(define, DataTypes, app){
  define("MaterialLexicalUnit", {
    senseId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: "materiallexicalunit",
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(model, refDb, refModel){
    app[refModel].MaterialLexicalUnit.belongsTo(app[refModel].Material, { as: "Material", foreignKey: "materialId", onDelete: "NO ACTION", onUpdate: "NO ACTION" });
    app[refModel].Material.hasMany(app[refModel].MaterialLexicalUnit, { foreignKey: "materialId" });
  })
};