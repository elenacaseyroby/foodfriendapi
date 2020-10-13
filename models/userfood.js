'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserFood = sequelize.define(
    'UserFood',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      servingsCount: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
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
