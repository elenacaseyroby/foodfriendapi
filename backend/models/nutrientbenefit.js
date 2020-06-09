'use strict';
module.exports = (sequelize, DataTypes) => {
  const NutrientBenefit = sequelize.define(
    'NutrientBenefit',
    {
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'nutrient_benefits',
      underscored: true,
      timestamps: false,
    }
  );
  return NutrientBenefit;
};
