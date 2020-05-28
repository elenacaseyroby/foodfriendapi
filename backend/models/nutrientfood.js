'use strict';
module.exports = (sequelize, DataTypes) => {
  const NutrientFood = sequelize.define(
    'NutrientFood',
    {
      percent_dv_per_serving: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
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
