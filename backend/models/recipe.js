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
      sourceNote: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      imagePath: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      trackableFoods: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      active: {
        allowNull: false,
        defaultValue: 1,
        type: DataTypes.BOOLEAN,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
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
      foreignKey: 'recipeId',
      otherKey: 'userId',
    });
    Recipe.belongsToMany(models.Nutrient, {
      through: 'NutrientRecipe',
      as: 'nutrients',
      foreignKey: 'recipeId',
      otherKey: 'nutrientId',
    });
  };
  return Recipe;
};
