'use strict';
module.exports = (sequelize, DataTypes) => {
  const NutrientFood = sequelize.define(
    'NutrientFood',
    {
      percent_dv_per_serving: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      dv_source: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
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
