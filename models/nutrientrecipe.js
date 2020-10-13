'use strict';
module.exports = (sequelize, DataTypes) => {
  const NutrientRecipe = sequelize.define(
    'NutrientRecipe',
    {
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'nutrient_recipes',
      underscored: true,
      timestamps: false,
    }
  );
  return NutrientRecipe;
};
