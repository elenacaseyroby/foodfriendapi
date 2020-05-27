'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserRecipe = sequelize.define(
    'UserRecipe',
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
      tableName: 'user_recipes',
      underscored: true,
      timestamps: false,
    }
  );
  return UserRecipe;
};
