'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserFood = sequelize.define(
    'UserFood',
    {
      servings_count: {
        type: Sequelize.DECIMAL(4, 2),
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
      tableName: 'user_foods',
      underscored: true,
      timestamps: false,
    }
  );
  return UserFood;
