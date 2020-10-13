'use strict';
module.exports = (sequelize, DataTypes) => {
  const PathTheme = sequelize.define(
    'PathTheme',
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING(50),
        unique: true,
      },
      header_img_path: {
        type: DataTypes.STRING(150),
      },
      footer_img_path: {
        type: DataTypes.STRING(150),
      },
      button_img_path: {
        type: DataTypes.STRING(150),
      },
    },
    {
      tableName: 'path_themes',
      underscored: true,
      timestamps: false,
    }
  );
  PathTheme.associate = function (models) {};
  return PathTheme;
};
