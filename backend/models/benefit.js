'use strict';
module.exports = (sequelize, DataTypes) => {
  const Benefit = sequelize.define(
    'Benefit',
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
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'benefits',
      underscored: true,
      timestamps: false,
    }
  );
  Benefit.associate = function (models) {
    Benefit.belongsToMany(models.Nutrient, {
      through: 'NutrientBenefit',
      as: 'nutrients',
      foreignKey: 'benefitId',
      otherKey: 'nutrientId',
    });
  };
  return Benefit;
};
