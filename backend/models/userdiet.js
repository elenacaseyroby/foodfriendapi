'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserDiet = sequelize.define(
    'UserDiet',
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
      tableName: 'user_diets',
      underscored: true,
      timestamps: false,
    }
  );
  return UserDiet;
};
