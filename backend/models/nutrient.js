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
      dv_in_mg: {
        allowNull: false,
        type: DataTypes.DECIMAL(12, 6),
      },
      dv_source: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      description_sources: {
        type: DataTypes.STRING,
      },
      warnings: {
        type: DataTypes.TEXT,
      },
      warnings_sources: {
        type: DataTypes.STRING,
      },
      source_note: {
        type: DataTypes.STRING,
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
      tableName: 'nutrients',
      underscored: true,
      timestamps: false,
    }
  );
  Nutrient.associate = function (models) {
    Nutrient.belongsToMany(models.Food, {
      through: 'NutrientFood',
      as: 'foods',
      foreignKey: 'nutrient_id',
      otherKey: 'food_id',
    });
    Nutrient.belongsToMany(models.Path, {
      through: 'PathNutrient',
      as: 'paths',
      foreignKey: 'nutrient_id',
      otherKey: 'path_id',
    });
    Nutrient.belongsToMany(models.Recipe, {
      through: 'NutrientRecipe',
      as: 'recipes',
      foreignKey: 'nutrient_id',
      otherKey: 'recipe_id',
    });
    Nutrient.belongsToMany(models.Benefit, {
      through: 'NutrientBenefit',
      as: 'benefits',
      foreignKey: 'nutrient_id',
      otherKey: 'benefit_id',
    });
  };
  return Nutrient;
};
