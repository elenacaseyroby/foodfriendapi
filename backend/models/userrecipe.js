'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserRecipe = sequelize.define(
    'UserRecipe',
    {
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
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
