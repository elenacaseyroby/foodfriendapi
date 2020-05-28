'use strict';
module.exports = (sequelize, DataTypes) => {
  const Benefit = sequelize.define(
    'Benefit',
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
      tableName: 'benefits',
      underscored: true,
      timestamps: false,
    }
  );
  Benefit.associate = function (models) {
    Benefit.belongsToMany(models.Nutrient, {
      through: 'NutrientBenefit',
      as: 'nutrients',
      foreignKey: 'benefit_id',
      otherKey: 'nutrient_id',
    });
  };
  return Benefit;
};
