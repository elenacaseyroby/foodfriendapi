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
      notes_sources: {
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
      tableName: 'paths',
      underscored: true,
      timestamps: false,
    }
  );
  Path.associate = function (models) {
    Path.belongsTo(models.User, { foreignKey: 'owner_id', targetKey: 'id' });
    Path.belongsToMany(models.Nutrient, {
      through: 'PathNutrient',
      as: 'nutrients',
      foreignKey: 'path_id',
      otherKey: 'nutrient_id',
    });
  };
  return Path;
};
