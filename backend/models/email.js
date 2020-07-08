'use strict';
module.exports = (sequelize, DataTypes) => {
  const Email = sequelize.define(
    'Email',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      fromEmail: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      toEmail: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      timeSent: {
        type: DataTypes.DATE,
      },
      subject: {
        allowNull: false,
        type: DataTypes.STRING(100),
      },
      body: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'emails',
      underscored: true,
      timestamps: false,
    }
  );
  return Email;
};
