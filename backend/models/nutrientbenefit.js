'use strict';
module.exports = (sequelize, DataTypes) => {
  const NutrientBenefit = sequelize.define(
    'NutrientBenefit',
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
      tableName: 'nutrient_benefits',
      underscored: true,
      timestamps: false,
    }
  );
  return NutrientBenefit;
};
