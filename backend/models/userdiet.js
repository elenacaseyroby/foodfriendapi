'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserDiet = sequelize.define(
    'UserDiet',
    {
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
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
