"use strict";

module.exports = function(define, DataTypes, app){
  define("Course", {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    slug: {
      type: DataTypes.STRING(255),
      uniq: true
    }
  }, {
    tableName: "course",
    indexes: [{
      name: "slug",
      fields: ["slug"]
    }]
  });

  define.after(function(model, refDb, refModel){

  })
};