'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserFood = sequelize.define(
    'UserFood',
    {
      servings_count: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'user_foods',
      underscored: true,
      timestamps: false,
    }
  );
  return UserFood;
};
