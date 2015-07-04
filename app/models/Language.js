"use strict";

module.exports = function(sequelize, DataTypes){
  var Language = sequelize.define("Language", {
    id: {
      type: DataTypes.INTEGER(5).UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    lemmaid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    iso3166_a2: {
      type: DataTypes.STRING(2),
      allowNull: false
    }
  }, {
    tableName: "languages",
    timestamp: false,
    classMethods: {
      associate: function(models){
        Language.hasMany(models.Sense);
      }
    }
  });
  return Language;
}