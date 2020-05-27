'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      first_name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      last_name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      birthday: {
        type: DataTypes.DATE,
      },
      is_vegan: {
        defaultValue: 0,
        type: DataTypes.BOOLEAN,
      },
      menstruates: {
        defaultValue: 0,
        type: DataTypes.BOOLEAN,
      },
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
      tableName: 'users',
      underscored: true,
      timestamps: false,
    }
  );
  User.associate = function (models) {
    User.belongsTo(models.Path, {
      foreignKey: 'active_path_id',
      targetKey: 'id',
    });
    User.belongsToMany(models.Diet, {
      through: 'UserDiet',
      as: 'diets',
      foreignKey: 'user_id',
      otherKey: 'diet_id',
    });
    User.belongsToMany(models.Recipe, {
      through: 'UserRecipe',
      as: 'recipes',
      foreignKey: 'user_id',
      otherKey: 'recipe_id',
    });
  };
  return User;
};
