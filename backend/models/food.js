'use strict';
module.exports = (sequelize, DataTypes) => {
  const Food = sequelize.define(
    'Food',
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      serving_size_note: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'foods',
      underscored: true,
      timestamps: false,
    }
  );
  Food.associate = function (models) {
    Food.belongsToMany(models.Nutrient, {
      through: 'NutrientFood',
      as: 'nutrients',
      foreignKey: 'food_id',
      otherKey: 'nutrient_id',
    });
  };
  return Food;
};
