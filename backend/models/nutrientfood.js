'use strict';
module.exports = (sequelize, DataTypes) => {
  const NutrientFood = sequelize.define(
    'NutrientFood',
    {
      percentDvPerServing: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      dvSource: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
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
