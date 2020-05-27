'use strict';
module.exports = (sequelize, DataTypes) => {
  const NutrientFood = sequelize.define(
    'NutrientFood',
    {
      percent_dv_per_serving: {
        type: DataTypes.DECIMAL(8, 5),
        allowNull: false,
      },
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
      tableName: 'nutrient_foods',
      underscored: true,
      timestamps: false,
    }
  );
  return NutrientFood;
};
