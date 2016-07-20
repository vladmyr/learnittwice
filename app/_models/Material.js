"use strict";

module.exports = function(define, DataTypes, app){
  define("Material", {
    alias: {
      type: DataTypes.STRING(255)
    }
  }, {
    tableName: "material"
  });

  define.after(function(model, refDb, refModel){
    app[refModel].Material.belongsTo(app[refModel].Course, { as: "Course", foreignKey: "courseId" });
    app[refModel].Course.hasMany(app[refModel].Material, { foreignKey: "courseId" });
  })
};