'use strict';
module.exports = (sequelize, DataTypes) => {
  const NutrientRecipe = sequelize.define(
    'NutrientRecipe',
    {
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
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
