'use strict';
module.exports = (sequelize, DataTypes) => {
  const Nutrient = sequelize.define(
    'Nutrient',
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
      dvInMg: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 6),
      },
      dvNote: {
        allowNull: false,
        type: DataTypes.STRING(15),
      },
      dvSource: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      descriptionSources: {
        type: DataTypes.STRING,
      },
      warnings: {
        type: DataTypes.TEXT,
      },
      warningsSources: {
        type: DataTypes.STRING,
      },
      sourceNote: {
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      themeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      iconPath: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
    },
    {
      tableName: 'nutrients',
      underscored: true,
      timestamps: false,
    }
  );
  Nutrient.associate = function (models) {
    Nutrient.belongsToMany(models.Food, {
      through: 'NutrientFood',
      as: 'foods',
      foreignKey: 'nutrientId',
      otherKey: 'foodId',
    });
    Nutrient.belongsToMany(models.Path, {
      through: 'PathNutrient',
      as: 'paths',
      foreignKey: 'nutrientId',
      otherKey: 'pathId',
    });
    Nutrient.belongsToMany(models.Recipe, {
      through: 'NutrientRecipe',
      as: 'recipes',
      foreignKey: 'nutrientId',
      otherKey: 'recipeId',
    });
    Nutrient.belongsToMany(models.Benefit, {
      through: 'NutrientBenefit',
      as: 'benefits',
      foreignKey: 'nutrientId',
      otherKey: 'benefitId',
    });
  };
  return Nutrient;
};
