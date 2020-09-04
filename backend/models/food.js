'use strict';
module.exports = (sequelize, DataTypes) => {
  const Food = sequelize.define(
    'Food',
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      servingSizeNote: {
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
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
      foreignKey: 'foodId',
      otherKey: 'nutrientId',
    });
    Food.belongsToMany(models.User, {
      through: 'UserFood',
      as: 'users',
      foreignKey: 'foodId',
      otherKey: 'userId',
    });
  };
  return Food;
};
