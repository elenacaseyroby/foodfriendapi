'use strict';
module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define(
    'Recipe',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
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
      userReportIsVerified: {
        allowNull: true,
        defaultValue: null,
        type: DataTypes.BOOLEAN,
      },
      isActive: {
        type: DataTypes.VIRTUAL,
        get() {
          return !(this.reportedByUserId && this.userReportIsVerified);
        },
      },
      isUnderReview: {
        type: DataTypes.VIRTUAL,
        get() {
          return !!this.reportedByUserId && this.userReportIsVerified === null;
        },
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
    Recipe.belongsTo(models.User, {
      foreignKey: 'reportedByUserId',
      as: 'reportedByUser',
      targetKey: 'id',
    });
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
