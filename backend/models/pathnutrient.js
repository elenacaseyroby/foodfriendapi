'use strict';
module.exports = (sequelize, DataTypes) => {
  const PathNutrient = sequelize.define(
    'PathNutrient',
    {
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'path_nutrients',
      underscored: true,
      timestamps: false,
    }
  );
  return PathNutrient;
};
