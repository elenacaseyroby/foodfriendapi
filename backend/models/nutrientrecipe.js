'use strict';
module.exports = (sequelize, DataTypes) => {
  const NutrientRecipe = sequelize.define(
    'NutrientRecipe',
    {
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
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
