"use strict";

module.exports = function(define, DataTypes, app){
  define("MaterialTextUnit", {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    }
  }, {
    tableName: "materialtextunit",
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(model, refDb, refModel){
    app[refModel].MaterialTextUnit.belongsTo(app[refModel].Material, { as: "Material", foreignKey: "materialId", onDelete: "NO ACTION", onUpdate: "NO ACTION" });
    app[refModel].Material.hasMany(app[refModel].MaterialTextUnit, { foreignKey: "materialId" });
  })
};