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
