'use strict';
module.exports = (sequelize, DataTypes) => {
  const NutrientBenefit = sequelize.define(
    'NutrientBenefit',
    {
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
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
