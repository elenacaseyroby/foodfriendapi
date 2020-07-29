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
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      notes: {
        type: DataTypes.TEXT,
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
    Path.belongsTo(models.PathTheme, {
      foreignKey: 'themeId',
      targetKey: 'id',
      as: 'theme',
    });
    // this should link to the activePathId foreign key on the User model
    // but it could get confused since the Path model also has the
    // ownerId foreign key to the User model:
    Path.hasMany(models.User, { foreignKey: 'activePathId', as: 'followers' });
    Path.belongsToMany(models.Nutrient, {
      through: 'PathNutrient',
      as: 'nutrients',
      foreignKey: 'pathId',
      otherKey: 'nutrientId',
    });
  };
  return Path;
};
