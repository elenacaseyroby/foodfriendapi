'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserDiet = sequelize.define(
    'UserDiet',
    {
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'user_diets',
      underscored: true,
      timestamps: false,
    }
  );
  return UserDiet;
};
