"use strict";

module.exports = function(define, DataTypes, app){
  define("Definition", {
    definition: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    priority: {
      type: DataTypes.INTEGER().UNSIGNED,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: "definition",
    timestamps: false,
    classMethods: {
      //associate: function(models){
      //  Definition.belongsTo(models.Synset, { foreignKey: "synsetid" });
      //}
    },
    instanceMethods: {

    }
  });

  define.after(function(){

  });
};