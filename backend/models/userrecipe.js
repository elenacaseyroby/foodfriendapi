'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserRecipe = sequelize.define(
    'UserRecipe',
    {
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
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
