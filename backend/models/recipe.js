'use strict';
module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define(
    'Recipe',
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      url: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      source_note: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      image_path: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      trackable_foods: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      active: {
        allowNull: false,
        defaultValue: 1,
        type: DataTypes.BOOLEAN,
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
      tableName: 'recipes',
      underscored: true,
      timestamps: false,
    }
  );
  Recipe.associate = function (models) {
    Recipe.belongsToMany(models.User, {
      through: 'UserRecipe',
      as: 'users',
      foreignKey: 'recipe_id',
      otherKey: 'user_id',
    });
    Recipe.belongsToMany(models.Nutrient, {
      through: 'NutrientRecipe',
      as: 'nutrients',
      foreignKey: 'recipe_id',
      otherKey: 'nutrient_id',
    });
  };
  return Recipe;
};
