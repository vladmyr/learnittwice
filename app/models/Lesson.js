"use strict";

module.exports = function(define, DataTypes, app){
  define("Lesson", {
    order: {
      type: DataTypes.INTEGER.UNSIGNED
    }
  }, {
    tableName: "lesson"
  });

  define.after(function(model, refDb, refModel){
    app[refModel].Lesson.belongsTo(app[refModel].Course, { as: "Course", foreignKey: "courseId", onUpdate: "CASCADE", onDelete: "CASCADE" });
    app[refModel].Course.hasMany(app[refModel].Lesson, { foreignKey: "courseId" });
  });
};