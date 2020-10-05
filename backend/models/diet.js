'use strict';
module.exports = (sequelize, DataTypes) => {
  const Diet = sequelize.define(
    'Diet',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'diets',
      underscored: true,
      timestamps: false,
    }
  );
  Diet.associate = function (models) {
    Diet.belongsToMany(models.User, {
      through: 'UserDiet',
      foreignKey: 'dietId',
      otherKey: 'userId',
    });
  };
  return Diet;
};
