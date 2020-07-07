'use strict';
module.exports = (sequelize, DataTypes) => {
  const Path = sequelize.define(
    'Path',
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
      notes: {
        type: DataTypes.STRING,
      },
      notesSources: {
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
      tableName: 'paths',
      underscored: true,
      timestamps: false,
    }
  );
  Path.associate = function (models) {
    Path.belongsTo(models.User, { foreignKey: 'ownerId', targetKey: 'id' });
    Path.belongsToMany(models.Nutrient, {
      through: 'PathNutrient',
      as: 'nutrients',
      foreignKey: 'pathId',
      otherKey: 'nutrientId',
    });
  };
  return Path;
};
