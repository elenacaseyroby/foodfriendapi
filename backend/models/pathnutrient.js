'use strict';
module.exports = (sequelize, DataTypes) => {
  const PathNutrient = sequelize.define(
    'PathNutrient',
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
      tableName: 'path_nutrients',
      underscored: true,
      timestamps: false,
    }
  );
  return PathNutrient;
};
