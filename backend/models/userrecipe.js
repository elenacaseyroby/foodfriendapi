'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserRecipe = sequelize.define(
    'UserRecipe',
    {
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'user_recipes',
      underscored: true,
      timestamps: false,
    }
  );
  return UserRecipe;
};
