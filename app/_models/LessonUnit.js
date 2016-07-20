"use strict";

module.exports = function(define, DataTypes, app){
  define("LessonUnit", {
    order: {
      type: DataTypes.INTEGER.UNSIGNED
    },
    viewTemplate: {
      type: DataTypes.INTEGER.UNSIGNED
    }
  }, {
    tableName: "lessonunit",
    classMethods: {

    },
    instanceMethods: {

    }
  });

  define.after(function(model, refDb, refModel){
    app[refModel].LessonUnit.belongsTo(app[refModel].Lesson, { as: "Lesson", foreignKey: "lessonId" });
    app[refModel].Lesson.hasMany(app[refModel].LessonUnit, { foreignKey: "lessonId" });

    //foreign key to two MaterialLexicalUnits
    app[refModel].LessonUnit.belongsTo(app[refModel].MaterialLexicalUnit, { as: "MaterialLexicalUnit1", foreignKey: "materialLexicalUnit1Id" });
    app[refModel].MaterialLexicalUnit.hasMany(app[refModel].LessonUnit, { foreignKey: "materialLexicalUnit1Id" });

    app[refModel].LessonUnit.belongsTo(app[refModel].MaterialLexicalUnit, { as: "MaterialLexicalUnit2", foreignKey: "materialLexicalUnit2Id" });
    app[refModel].MaterialLexicalUnit.hasMany(app[refModel].LessonUnit, { foreignKey: "materialLexicalUnit2Id" });

    //foreign key to two MaterialTextUnits
    app[refModel].LessonUnit.belongsTo(app[refModel].MaterialTextUnit, { as: "MaterialTextUnit1", foreignKey: "materialTextUnit1Id" });
    app[refModel].MaterialTextUnit.hasMany(app[refModel].LessonUnit, { foreignKey: "materialTextUnit1Id" });

    app[refModel].LessonUnit.belongsTo(app[refModel].MaterialTextUnit, { as: "MaterialTextUnit2", foreignKey: "materialTextUnit2Id" });
    app[refModel].MaterialTextUnit.hasMany(app[refModel].LessonUnit, { foreignKey: "materialTextUnit2Id" });

    //foreign key to one MaterialMediaUnit
    app[refModel].LessonUnit.belongsTo(app[refModel].MaterialMediaUnit, { as: "MaterialMediaUnit1", foreignKey: "materialMediaUnitId" });
    app[refModel].MaterialMediaUnit.hasMany(app[refModel].LessonUnit, { foreignKey: "materialMediaUnitId" });

    //may be redundant
    app[refModel].LessonUnit.belongsTo(app[refModel].Material, { as: "Material", foreignKey: "materialId" });
    app[refModel].Material.hasMany(app[refModel].LessonUnit, { foreignKey: "materialId" });
  });
};