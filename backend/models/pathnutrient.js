'use strict';
module.exports = (sequelize, DataTypes) => {
  const PathNutrient = sequelize.define(
    'PathNutrient',
    {
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
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
