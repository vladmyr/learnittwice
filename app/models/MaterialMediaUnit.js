"use strict";

module.exports = function(define, DataTypes, app){
  define("MaterialMediaUnit", {
    mediaType: {
      type: DataTypes.ENUM("0","1","2"),
      allowNull: false,
      defaultValue: "0"
    },
    filepathMaster: {
      type: DataTypes.STRING(),
      allowNull: false,
      defaultValue: ""
    },
    baseMaster: {
      type: DataTypes.STRING(),
      allowNull: false,
      defaultValue: ""
    }
  }, {
    tableName: "materialmediaunit",
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(model, refDb, refModel){
    app[refModel].MaterialMediaUnit.belongsTo(app[refModel].Material, { as: "Material", foreignKey: "materialId", onDelete: "NO ACTION", onUpdate: "NO ACTION" });
    app[refModel].Material.hasMany(app[refModel].MaterialMediaUnit, { foreignKey: "materialId" });
  })
};