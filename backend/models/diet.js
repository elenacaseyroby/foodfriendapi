'use strict';
module.exports = (sequelize, DataTypes) => {
  const Diet = sequelize.define(
    'Diet',
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
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
      tableName: 'diets',
      underscored: true,
      timestamps: false,
    }
  );
  Diet.associate = function (models) {
    Diet.belongsToMany(models.User, {
      through: 'UserDiet',
      as: 'users',
      foreignKey: 'diet_id',
      otherKey: 'user_id',
    });
  };
  return Diet;
};
